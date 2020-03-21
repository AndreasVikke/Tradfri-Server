function buttonOnOff(e) {
    if($(e).attr('data-state') == "true") {
        change_light_state($(e).attr('data-id'), "false", e);
        $(e).attr('data-state', 'false');
    }
    else {
        change_light_state($(e).attr('data-id'), "true", e)
        $(e).attr('data-state', 'true');
    }
    $(e).parent().siblings('.card-img-top').children('.fas').toggleClass("light-toggle")
};
function changeState(e) {
    change_light_dimmer($(e).attr('data-id'), parseInt(e.value), e)
};
function buttonColor(e) {
    change_light_color($(e).parent().attr('data-id'), e)
};
function buttonColorsShow(e) {
    $("#colors").attr("data-id", $(e).attr("data-id"));
    $("#colors-name").html($(e).attr("data-name"));
    $(".color-box").toggleClass('hidden');
};

function buttonColorsHide(e) {
    $(".color-box").toggleClass('hidden');
}

function change_light_state(id, lightstate, e) {
    $.ajax({
        url: '/api/lights/state/' + id,
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({state : lightstate}),
        success: function(response) {
            if(response.light.state.toString() == "true")
                get_light_dimmer(id, e)
            else
                $(e).siblings(".dimmer").val(0)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function change_light_dimmer(id, lightdimmer, e) {
    $.ajax({
        url: '/api/lights/dimmer/' + id,
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({dimmer : lightdimmer}),
        success: function(response) {
            $(e).val(response.light.dimmer)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function change_light_color(id, e) {
    $.ajax({
        url: '/api/lights/color/' + id,
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({color : $(e).attr("data-xy").split(",")}),
        success: function(response) {
            console.log(response)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function get_light_dimmer(id, e) {
    $.ajax({
        url: '/api/lights/dimmer/' + id,
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            $(e).siblings(".dimmer").val(response.light.dimmer)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

get_lights();
function get_lights() {
    $.ajax({
        url: '/api/lights',
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            response.forEach(light => {
                $('#lights').append(create_card(light))
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

get_colors();
function get_colors() {
    $.ajax({
        url: '/api/colors',
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            console.log(response)
            response.colors.forEach(color => {
                $('#colors').append($('<div/>', {
                    "class" : "color",
                    "onclick" : "buttonColor(this)",
                    "data-id" : 0,
                    "data-xy" : `${color.xy[0]},${color.xy[1]}`,
                    "style" : `background-color: rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]})`
                }))
            });
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function create_card(light) {
    console.log(light.type)
    card = $('<div/>', {
        "class" : "card",
    });
    card.append($('<div/>', {
        "class" : "card-img-top"
    }).html($("<i />", {
        "class" : `fas fa-lightbulb fa-5x ${(light.state == true ? "light-toggle" : "")}`,
        "data-id" : light.id,
        "data-name" : light.name,
        "onclick" : `${light.type == 29 ? 'buttonColorsShow(this)' : ''}`
    })))
    card_body = $('<div/>', {
        "class" : "card-body"
    });
    card_body.append($("<h5/>").html(light.name))
    card_body.append($("<br/>"))
    card_body.append($("<button/>", {
        "class" : "onoff",
        "data-id" : light.id,
        "data-state" : light.state,
        "onclick" : "buttonOnOff(this)",
    }).html("<i class='fas fa-power-off fa-2x'></i>"))
    card_body.append($("<input/>", {
        "class" : "dimmer",
        "data-id" : light.id,
        "type" : "range",
        "min" : "0",
        "max" : "254",
        "value" : (light.state == true ? light.dimmer : 0) ,
        "onchange" : "changeState(this)",
    }).html("<i class='fas fa-power-off fa-2x'></i>"))
    card.append(card_body)
    return card;
}