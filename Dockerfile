# Container image of the UI test harness. It is not a service: the entrypoint runs the
# TestNG suite once and exits, which is what the ECS task / EKS job below executes.
#
# Single stage on the Maven+JDK image on purpose: Surefire's `test` phase re-runs
# `testCompile`, so the runtime needs a JDK (not a JRE), and the Maven that primes
# ~/.m2 must be the same version that runs later — a different Maven binds different
# default lifecycle plugin versions and offline (`-o`) resolution then fails.
FROM maven:3.9.9-eclipse-temurin-21

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg jq unzip \
 && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends google-chrome-stable \
 && rm -rf /var/lib/apt/lists/*

# Bake a chromedriver matching the installed Chrome into the Selenium cache layout that
# WebDriverManager reads, so no driver is downloaded at run time (the ECS task may run in
# a private subnet with no egress).
RUN set -eux; \
    CHROME_FULL="$(google-chrome --version | awk '{print $3}')"; \
    CHROME_BUILD="$(echo "${CHROME_FULL}" | cut -d. -f1-3)"; \
    DRIVER_VERSION="$(curl -fsSL https://googlechromelabs.github.io/chrome-for-testing/latest-patch-versions-per-build.json \
      | jq -r --arg b "${CHROME_BUILD}" '.builds[$b].version')"; \
    curl -fsSL -o /tmp/chromedriver.zip \
      "https://storage.googleapis.com/chrome-for-testing-public/${DRIVER_VERSION}/linux64/chromedriver-linux64.zip"; \
    unzip -q -j /tmp/chromedriver.zip chromedriver-linux64/chromedriver -d /usr/local/bin; \
    chmod +x /usr/local/bin/chromedriver; \
    mkdir -p "/root/.cache/selenium/chromedriver/linux64/${DRIVER_VERSION}"; \
    cp /usr/local/bin/chromedriver "/root/.cache/selenium/chromedriver/linux64/${DRIVER_VERSION}/chromedriver"; \
    rm -f /tmp/chromedriver.zip

WORKDIR /harness
COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
# Prime the local repository by really executing the suite once: dependency:go-offline does
# not fetch the default lifecycle plugins, and Surefire resolves its provider
# (surefire-testng) only when tests actually run — skipping execution leaves it missing and
# the offline entrypoint then fails. Failures here are ignored: this layer exists to warm
# ~/.m2, not to gate the build (the suite drives an external site).
RUN mvn -B -ntp test-compile \
 && mvn -B -ntp test \
      -Dsurefire.suiteXmlFiles=src/test/resources/suites/smoke.xml \
      -Dwebdriver.chrome.driver=/usr/local/bin/chromedriver \
      -Dmaven.test.failure.ignore=true \
 && rm -rf target/surefire-reports test-output ExtentReports logfile.log

ENV SUITE_FILE=src/test/resources/suites/smoke.xml
# Deliberately not named MAVEN_ARGS: Maven 3.9 auto-consumes that variable, which would
# apply these flags to every mvn invocation in the image.
ENV HARNESS_MAVEN_ARGS="-B -ntp -o"

ENTRYPOINT ["/bin/sh", "-c", "mvn ${HARNESS_MAVEN_ARGS} test -Dsurefire.suiteXmlFiles=${SUITE_FILE} -Dwebdriver.chrome.driver=/usr/local/bin/chromedriver"]
