FROM nginx:1.15
COPY angular/dist/angular/ /usr/share/nginx/html
RUN ls -al /usr/share/nginx/html


