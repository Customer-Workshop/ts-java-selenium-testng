# Runner image for the Selenium/TestNG suite. The container is the delivered
# artifact: CD pushes it to (a mocked) Amazon ECR and runs it as an ECS task.
FROM maven:3.9-eclipse-temurin-17

ENV DEBIAN_FRONTEND=noninteractive

# Google Chrome plus the matching Chrome for Testing chromedriver, so the suite
# never has to download a driver at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates fonts-liberation unzip wget \
    && wget -q -O /tmp/chrome.deb https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb \
    && apt-get install -y --no-install-recommends /tmp/chrome.deb \
    && chrome_version="$(google-chrome --version | awk '{print $3}')" \
    && wget -q -O /tmp/chromedriver.zip "https://storage.googleapis.com/chrome-for-testing-public/${chrome_version}/linux64/chromedriver-linux64.zip" \
    && unzip -j /tmp/chromedriver.zip chromedriver-linux64/chromedriver -d /usr/local/bin \
    && chmod +x /usr/local/bin/chromedriver \
    && rm -f /tmp/chrome.deb /tmp/chromedriver.zip \
    && rm -rf /var/lib/apt/lists/*

# BaseTest picks the driver up from CHROMEWEBDRIVER instead of downloading one.
ENV CHROMEWEBDRIVER=/usr/local/bin

WORKDIR /automation

COPY pom.xml ./
RUN mvn -ntp -B dependency:go-offline

COPY src ./src

RUN mvn -ntp -B test-compile

ENV SUITE_XML_FILE=./src/test/resources/suites/testng.xml \
    BROWSER=chrome

ENTRYPOINT ["/bin/sh", "-c", "mvn -ntp -B test -DsuiteXmlFile=$SUITE_XML_FILE -Dbrowser=$BROWSER -Dheadless=true"]
