FROM python:3

HEALTHCHECK CMD curl --fail http://localhost:5000/ping

ENV ENVIRONMENT=DEV

ADD docker-entrypoint.sh /

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["/opt/docker-socket-monitor.py"]

ADD resources/ /opt

RUN pip3 install -r /opt/requirements.txt
