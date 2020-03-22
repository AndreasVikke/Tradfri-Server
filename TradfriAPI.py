from pytradfri import Gateway
from pytradfri.api.libcoap_api import APIFactory

def get_api():
    api_factory = APIFactory(host='192.168.1.2', psk_id='f712f4d5aaa642bcbce7ab5cf501bca9', psk='HkNXWgUOl2u0cUUa')
    api = api_factory.request
    return api

def get_lights():
    api = get_api()
    gateway = Gateway()
    
    devices = api(api(gateway.get_devices()))
    return [dev for dev in devices if dev.has_light_control]

def get_sockets():
    api = get_api()
    gateway = Gateway()

    devices = api(api(gateway.get_devices()))
    return [dev for dev in devices if dev.has_socket_control]

def set_state(id, state):
    api = get_api()
    lights = get_lights()

    if id == 1:
        for socket in get_sockets():
            api(socket.socket_control.set_state(state))

    api(lights[id].light_control.set_state(state))
    return True

def set_state_all(state):
    for idx, light in enumerate(get_lights()):
        set_state(idx, state)
    for idx, socket in enumerate(get_sockets()):
        set_state(idx, state)
    return True

def set_dimmer(id, dimmer):
    api = get_api()
    lights = get_lights()

    api(lights[id].light_control.set_dimmer(dimmer))
    return True

def set_color(id, xy):
    api = get_api()
    lights = get_lights()

    api(lights[id].light_control.set_xy_color(int(xy[0]), int(xy[1])))
    api(lights[id].light_control.set_state(True))
    return True