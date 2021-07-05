FROM nginx:1.21.0-alpine
COPY ./build /usr/share/nginx/html
CMD ["sh", "-c", "nginx -g 'daemon off;'"]
