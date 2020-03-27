/*
    === Init ===
*/

get_groups();
get_colors();

/*
    === On Click Functions
*/
function change_group_state_event(e) {
    change_group_state($(e));
}
function change_group_dimmer_event(e) {
    change_group_dimmer($(e))
}
function change_group_color_event(e) {
    change_group_color($(e))
}
function color_group_show_event(e) {
    $("#colors").attr("data-id", $(e).attr("data-id"));
    $("#colors-name").html($(e).attr("data-name"));
    $(".color-box").toggleClass('hidden');
}
function color_group_hide_event() {
    $(".color-box").toggleClass('hidden');
}
function change_group_state_all_event(state) {
    change_group_state_all(state);
}

/*
    === AJAX Functions ===
*/
function change_group_state_all(state) {
    $.ajax({
        url: '/api/group/state',
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({state : state}),
        success: function(response) {
            update_groups(response);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function change_group_state(e) {
    $.ajax({
        url: '/api/group/state/' + e.attr('data-id'),
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({state : e.attr('data-state') == "true" ? "false" : "true"}),
        success: function(response) {
            if(response.light.state)
                get_group_dimmer(e)
            else
                e.siblings(".dimmer").val(0)

            e.parent().siblings('.card-img-top').children('.fas').toggleClass("light-toggle")
            e.attr('data-state', response.light.state);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function change_group_dimmer(e) {
    $.ajax({
        url: '/api/group/dimmer/' + e.attr('data-id'),
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({dimmer : parseInt(e.val())}),
        success: function(response) {
            e.val(response.light.dimmer)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function change_group_color(e) {
    $.ajax({
        url: '/api/group/color/' + $("#colors").attr('data-id'),
        dataType: "json",
        contentType: "application/json",
        type: 'POST',
        data: JSON.stringify({color : e.attr("data-xy").split(",")}),
        success: function(response) {
            get_groups()
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function get_group_dimmer(e) {
    $.ajax({
        url: '/api/group/dimmer/' + e.attr('data-id'),
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            e.siblings(".dimmer").val(response.light.dimmer)
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function get_groups() {
    $.ajax({
        url: '/api/group/all',
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            console.log(response)
            update_groups(response);
            setTimeout(get_groups, 300000);
        },
        error: function(error) {
            console.log(error);
        }
    });
}

function get_colors() {
    $.ajax({
        url: '/api/colors/all',
        dataType: "json",
        contentType: "application/json",
        type: 'GET',
        success: function(response) {
            console.log(response)
            response.colors.forEach(color => {
                $('#colors').append($('<div/>', {
                    "class" : "color",
                    "onclick" : "change_group_color_event(this)",
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

/*
    === Create Functions ===
*/
function update_groups(response) {
    $('#lights').html('');
    response.forEach(light => {
        $('#lights').append(create_card(light))
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
        "class" : `fas fa-lightbulb fa-5x ${(light.state != true ? "light-toggle" : "")}`,
        "data-id" : light.id,
        "data-name" : light.name,
        "onclick" : `${light.type == 29 ? 'color_group_show_event(this)' : ''}`,
        "style" : light.color != null ? `color: rgb(${light.color[0]},${light.color[1]},${light.color[2]})` : ""
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
        "onclick" : "change_group_state_event(this)",
    }).html("<i class='fas fa-power-off fa-2x'></i>"))
    card_body.append($("<input/>", {
        "class" : "dimmer",
        "data-id" : light.id,
        "type" : "range",
        "min" : "0",
        "max" : "254",
        "value" : (light.state == true ? light.dimmer : 0) ,
        "onchange" : "change_group_dimmer_event(this)",
    }).html("<i class='fas fa-power-off fa-2x'></i>"))
    card.append(card_body)
    return card;
}

/*
    === Clock Functions ===
*/
function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = zeroInt(m);
    s = zeroInt(s);
    y = today.getFullYear();
    mm = today.getMonth()+1;
    d = today.getDate();
    document.getElementById('clock').innerHTML =
    h + ":" + m + ":" + s + " - " + zeroInt(d) + "/" + zeroInt(mm) + "/" + y;
    var t = setTimeout(startTime, 500);
  }
  function zeroInt(i) {
    if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
    return i;
  }