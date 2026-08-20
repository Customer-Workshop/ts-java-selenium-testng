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
# Compile, then walk the full `test` lifecycle with execution skipped: dependency:go-offline
# does not fetch the default lifecycle plugins (resources/compiler/surefire), which offline
# runs need in the local repository.
RUN mvn -B -ntp test-compile \
 && mvn -B -ntp test -Dmaven.test.skip.exec=true

ENV SUITE_FILE=src/test/resources/suites/smoke.xml
ENV MAVEN_ARGS="-B -ntp -o"

ENTRYPOINT ["/bin/sh", "-c", "mvn ${MAVEN_ARGS} test -Dsurefire.suiteXmlFiles=${SUITE_FILE} -Dwebdriver.chrome.driver=/usr/local/bin/chromedriver"]
