from flask import Flask, request, render_template, jsonify, abort
import TradfriAPI as tfapi
import json
import sys
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

# === GET ===
@app.route('/api/group/all')
def get_group_all():
    lights = tfapi.get_lights()    
    return jsonify([
        {'name' : dev.name, 
        'id' : idx, 
        'type' : dev.light_control.lights[0].supported_features, 
        'state' : dev.light_control.lights[0].state, 
        'dimmer' : dev.light_control.lights[0].dimmer,
        'color' : get_rgb_color_by_xy(dev.light_control.lights[0].xy_color)} for idx, dev in enumerate(lights)])  

@app.route('/api/group/state/<int:id>', methods=['GET'])
def get_group_state(id):
    lights = tfapi.get_lights()   
    state = lights[id].light_control.lights[0].state
    return jsonify({'light' : {'id' : id, 'state' : state}})

@app.route('/api/group/dimmer/<int:id>', methods=['GET'])
def get_group_dimmer(id):
    lights = tfapi.get_lights()   
    dimmer = lights[id].light_control.lights[0].dimmer
    return jsonify({'light' : {'id' : id, 'dimmer' : dimmer}})

@app.route('/api/group/color/<int:id>', methods=['GET'])
def get_group_color(id):
    lights = tfapi.get_lights()   
    color = lights[id].light_control.lights[0].xy_color
    return jsonify({'light' : {'id' : id, 'color' : color}})

@app.route('/api/colors/all', methods=['GET'])
def get_group_colors():
    with open(os.path.join(app.root_path, 'colors.json')) as f:
        d = json.load(f)
        return jsonify(d)

@app.route('/api/colors/rgb', methods=['GET'])
def get_rgb_color():
    if not request.json or not 'color' in request.json:
        abort(400, 'No color in body')

    xy = request.json['color']
    if len(xy) != 2:
        abort(400, 'Color must contain x and y value')

    return get_rgb_color_by_xy(xy)

def get_rgb_color_by_xy(xy):
    if xy == None:
        return None
    with open(os.path.join(app.root_path, 'colors.json')) as f:
        d = json.load(f)
        for color in d['colors']:
            if color['xy'][0] == xy[0] and color['xy'][1] == xy[1]:
                return color['rgb']

# === POST ===
@app.route('/api/group/state', methods=['POST'])
def set_group_state_all():
    if not request.json or not 'state' in request.json:
        abort(400, 'No state in body')

    state = request.json['state'] in ("true")
    if state != True and state != False:
        abort(400, 'State must bee either true or false')

    tfapi.set_state_all(state)
    return get_group_all()

@app.route('/api/group/state/<int:id>', methods=['POST'])
def set_group_state(id):
    if not request.json or not 'state' in request.json:
        abort(400, 'No state in body')

    state = request.json['state'] in ("true")
    if state != True and state != False:
        abort(400, 'State must bee either true or false')

    tfapi.set_state(id, state)
    return jsonify({'light' : {'id' : id, 'state' : state}})

@app.route('/api/group/dimmer/<int:id>', methods=['POST'])
def set_group_dimmer(id):
    if not request.json or not 'dimmer' in request.json:
        abort(400, 'No dimmer in body')

    dimmer = request.json['dimmer']
    if dimmer < 0 or dimmer > 254:
        abort(400, 'Dimmer must bee between 0 and 254')

    tfapi.set_dimmer(id, dimmer)
    return jsonify({'light' : {'id' : id, 'dimmer' : dimmer}})

@app.route('/api/group/color/<int:id>', methods=['POST'])
def set_group_color(id):
    if not request.json or not 'color' in request.json:
        abort(400, 'No color in body')

    xy = request.json['color']
    if len(xy) != 2:
        abort(400, 'Color must contain x and y value')

    tfapi.set_color(id, xy)
    return jsonify({'light' : {'id' : id, 'color' : xy}})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)