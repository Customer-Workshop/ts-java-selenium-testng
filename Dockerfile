# Container image of the UI test harness. It is not a service: the entrypoint runs the
# TestNG suite once and exits, which is what the ECS task / EKS job below executes.
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /workspace
COPY pom.xml ./
RUN mvn -B -ntp dependency:go-offline
COPY src ./src
RUN mvn -B -ntp -DskipTests test-compile

FROM eclipse-temurin:21-jre-jammy
ENV DEBIAN_FRONTEND=noninteractive
# Chrome + a matching chromedriver are baked in so WebDriverManager never downloads a
# driver at runtime (the task may run in a private subnet with no egress).
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl gnupg unzip maven \
 && curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends google-chrome-stable \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /harness
COPY --from=build /root/.m2 /root/.m2
COPY --from=build /workspace /harness

ENV SUITE_FILE=src/test/resources/suites/smoke.xml
ENV MAVEN_ARGS="-B -ntp -o"

ENTRYPOINT ["/bin/sh", "-c", "mvn ${MAVEN_ARGS} test -Dsurefire.suiteXmlFiles=${SUITE_FILE}"]
