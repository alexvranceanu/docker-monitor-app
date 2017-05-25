import os
import sys
import argparse
from dockerevents import DockerEvents
from flask import Flask, jsonify, render_template
from flask_socketio import SocketIO
from utils.logger import Logger
from threading import Thread
import eventlet
eventlet.monkey_patch()

log = Logger().setup('docker-socket-monitor')
app = Flask('docker-socket-monitor')
app.config['SECRET_KEY'] = 'secret!'
app.config.update(dict(HOST='0.0.0.0'))
app.debug=False
socketio = SocketIO(app, logger=True, engineio_logger=True)


@socketio.on('docker_event')
def print_event(message):
    log.debug("docker_event: message received: %s", message)
    socketio.emit('message', {'data': message})


@socketio.on('connect')
def print_connect():
    log.debug("connect: some user connected")

@app.route('/', methods=['GET'])
def index():
    return render_template('index2.html')

@app.route('/docker/nodes', methods=['GET'])
def docker_nodes():
    dn = dockerClient.cli.nodes.list()
    log.debug("docker_nodes: %s",dn)
    nodes=[]
    for node in dn:
        nodes.append(node.attrs)
    return jsonify(nodes)

@app.route('/docker/services', methods=['GET'])
def docker_services():
    ds = dockerClient.cli.services.list()
    log.debug("docker_services: %s",ds)
    services=[]
    for service in ds:
        services.append(service.attrs)
    return jsonify(services)

@app.route('/env', methods=['GET'])
def get_env():
    return os.getenv('ENV', 'DEV')

@app.route('/version', methods=['GET'])
def get_version():
    return os.getenv('VERSION', '1.0')

@app.route('/ping', methods=['GET'])
def get_ping():
    response = {'message': 'ok', 'code': 200}
    if isinstance(dockerClient, DockerEvents):
        try:
            dockerClient.cli.ping()
        except:
            response['code']=503
            response['message']=str(sys.exc_info()[1])

    return jsonify(response),response['code']


def start_docker(dockercli):
    dockercli.listen()

app.debug = True
app.logger.setLevel(0)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Docker Socket Monitor')

    #Define exclusive options (either -u or -r, cannot be used together)
    parser.add_argument('-n', '--namespace', nargs=1, action='store', dest='namespace', help='SocketIO Namespace',
                        required=False, metavar='/docker', default='/docker')
    group = parser.add_mutually_exclusive_group(required=False)
    group.add_argument('-u', '--unix', nargs=1, action='store', dest='docker_socket', help='Docker UNIX Socket Path',
                       required=False, metavar='unix_socket', default='unix:///var/run/docker.sock')
    group.add_argument('-r', '--remote', nargs=1, action='store', dest='docker_socket', help='Docker Remote API URL',
                       required=False, metavar='URL')

    #Parse arguments
    args = parser.parse_args()

    # The args.docker_socket variable may be of type 'list' instead of 'str'
    if isinstance(args.docker_socket, list):
        docker_socket = args.docker_socket[0]
    else:
        docker_socket = args.docker_socket
    log.debug("docker_socket: %s", docker_socket)

    # Connect to Docker socket
    dockerClient = DockerEvents(docker_socket, socketio, args.namespace, listen=False)

    # Start listening for events in a separate thread
    ds = Thread(target=start_docker, kwargs={'dockercli': dockerClient})
    ds.start()

    # Start the socketio server
    log.debug("Starting socketio...")
    socketio.run(app, host='0.0.0.0', use_reloader=False)
