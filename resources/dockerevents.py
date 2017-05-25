from docker import DockerClient
import docker.tls as tls
from os import path
from utils.logger import Logger


class DockerEvents(staticmethod):
    def __init__(self, docker_socket, socketio, namespace='/docker', ssl=False, listen=True, events_filter={'type': 'container'}):
        self.docker_socket = docker_socket
        self.socketio = socketio
        self.namespace = namespace
        self.filter = events_filter
        self.ssl = ssl
        self.log = Logger().setup('dockerevents')

        if self.ssl:
            CERTS = path.join(path.expanduser('~'), '.docker', 'machine', 'machines', "default")

            tls_config = tls.TLSConfig(
                    client_cert=(path.join(CERTS, 'cert.pem'), path.join(CERTS,'key.pem')),
                    ca_cert=path.join(CERTS, 'ca.pem'),
                    verify=False
            )
            self.cli = DockerClient(base_url=docker_socket, tls=tls_config)
        else:
            self.cli = DockerClient(base_url=docker_socket)

        if listen:
            self.listen()

    def listen(self):
        while True:
            for event in self.cli.events(filters=self.filter):
                self.log.debug("Captured event: "+event.decode())
                self.socketio.emit('dockerevent', event.decode(), broadcast=True, namespace=self.namespace)
