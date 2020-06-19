FROM nginx
COPY ./build           /usr/share/nginx/html
COPY ./config-genrator /usr/share/nginx/html/config-genrator

# Add NodeJS so that we can run the sync-conditions script
RUN apt-get update
RUN apt-get install -y -q curl gnupg2
RUN curl -sL https://deb.nodesource.com/setup_9.x | bash
RUN apt-get -y -q install nodejs
WORKDIR /usr/share/nginx/html/config-genrator
CMD npm i