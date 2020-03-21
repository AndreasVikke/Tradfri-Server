from flask import Flask, request, render_template, jsonify, abort
import sys
import os
import json

from pytradfri import Gateway
from pytradfri.api.libcoap_api import APIFactory

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/lights/')
def ligth_list():
    connect()
    lights = get_lights()
    return jsonify(lights)

@app.route('/api/lights/state/<int:id>', methods=['GET'])
def get_light_state(id):
    connect()
    lights = get_light_devices()

    state = lights[id].light_control.lights[0].state
    return jsonify({'light' : {'id' : id, 'state' : state}})

@app.route('/api/lights/dimmer/<int:id>', methods=['GET'])
def get_light_dimmer(id):
    connect()
    lights = get_light_devices()

    dimmer = lights[id].light_control.lights[0].dimmer
    return jsonify({'light' : {'id' : id, 'dimmer' : dimmer}})

@app.route('/api/colors/', methods=['GET'])
def get_light_colors():
    with open(os.path.join(app.root_path, 'colors.json')) as f:
        d = json.load(f)
        return jsonify(d)

@app.route('/api/lights/state/<int:id>', methods=['POST'])
def set_light_state(id):
    if not request.json or not 'state' in request.json:
        abort(400, 'No state in body')

    state = request.json['state'] in ("true")
    if state != True and state != False:
        abort(400, 'State must bee either true or false')

    api = connect()
    lights = get_light_devices()

    if id == 1:
        for socket in get_socket_devices():
            api(socket.socket_control.set_state(state))

    api(lights[id].light_control.set_state(state))
    return jsonify({'light' : {'id' : id, 'state' : state}})

@app.route('/api/lights/dimmer/<int:id>', methods=['POST'])
def set_light_dimmer(id):
    if not request.json or not 'dimmer' in request.json:
        abort(400, 'No dimmer in body')

    dimmer = request.json['dimmer']
    if dimmer < 0 or dimmer > 254:
        abort(400, 'Dimmer must bee between 0 and 254')

    api = connect()
    lights = get_light_devices()

    api(lights[id].light_control.set_dimmer(dimmer))
    return jsonify({'light' : {'id' : id, 'dimmer' : dimmer}})

@app.route('/api/lights/color/<int:id>', methods=['POST'])
def set_light_color(id):
    if not request.json or not 'color' in request.json:
        abort(400, 'No color in body')

    xy = request.json['color']

    api = connect()
    lights = get_light_devices()

    api(lights[id].light_control.set_xy_color(int(xy[0]), int(xy[1])))
    api(lights[id].light_control.set_state(True))
    return jsonify({'light' : {'id' : id, 'color' : xy}})


def connect():
    api_factory = APIFactory(host='192.168.1.2', psk_id='f712f4d5aaa642bcbce7ab5cf501bca9', psk='HkNXWgUOl2u0cUUa')
    api = api_factory.request
    return api

def get_lights():
    api = connect()
    gateway = Gateway()
    devices_command = gateway.get_devices()
    devices_commands = api(devices_command)
    devices = api(devices_commands)
    lights = [{'name' : dev.name, 'id' : idx, 'type' : dev.light_control.lights[0].supported_features, 'state' : dev.light_control.lights[0].state, 'dimmer' : dev.light_control.lights[0].dimmer} for idx, dev in enumerate(devices) if dev.has_light_control]
    return lights

def get_light_devices():
    api = connect()
    gateway = Gateway()
    devices_command = gateway.get_devices()
    devices_commands = api(devices_command)
    devices = api(devices_commands)
    lights = [dev for dev in devices if dev.has_light_control]
    return lights

def get_socket_devices():
    api = connect()
    gateway = Gateway()
    devices_command = gateway.get_devices()
    devices_commands = api(devices_command)
    devices = api(devices_commands)
    sockets = [dev for dev in devices if dev.has_socket_control]
    return sockets



if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)