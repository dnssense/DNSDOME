FROM nginx:1.19-alpine
COPY angular/dist/angular/ /usr/share/nginx/html
COPY pagenotfound/  /usr/share/nginx/html/pagenotfound/
RUN ls /etc/nginx/conf.d
RUN ls /etc/nginx
RUN cat /etc/nginx/nginx.conf
RUN cat /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN ls -al /usr/share/nginx/html
RUN ls -al /usr/share/nginx/html/pagenotfound/


