// ==UserScript==
// @id             iitc-plugin-group-plan
// @name           IITC plugin: Group Plan
// @category       Layer
// @version        0.0.4
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      
// @downloadURL    
// @description    Shows plans with team members
// @require        http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js
// @include        https://www.ingress.com/intel*
// @include        http://www.ingress.com/intel*
// @match          https://www.ingress.com/intel*
// @match          http://www.ingress.com/intel*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
    if(typeof window.plugin !== 'function') window.plugin = function() {};
    
    window.plugin.groupPlan = function() {};
    
    
    window.plugin.groupPlan.settings = function() {
         html = "<b>Server URL :</b><input type=\"text\" name=\"ServerURL\" value=\""
         html = html + window.plugin.groupPlan.url+"\"onchange=\"window.plugin.groupPlan.url=this.value\"></br>"
         html = html + "<b>Drawing Layer :</b><input type=\"text\" name=\"context\" onchange=\"window.plugin.groupPlan.context=this.value\" value=\"" + window.plugin.groupPlan.context + "\"></br>"
         html = html + "<b>Server Username :</b><input type=\"text\" name=\"ServerUsername\" onchange=\"window.plugin.groupPlan.username=this.value\" ></br>"
         html = html + "<b>Server Password :</b><input type=\"text\" onchange=\"window.plugin.groupPlan.password=this.value\" name=\"Password\"></br>"
         dialog({

      html: html,
      title: 'Settings'
    });

    }




    window.plugin.groupPlan.updateHidden = function(playername, status){
console.log(status)
    if (status == true){
        window.plugin.groupPlan.useruuidmapping[playername] = ""
if (window.plugin.groupPlan.hidden.indexOf(playername) > -1) {

    window.plugin.groupPlan.hidden.splice(window.plugin.groupPlan.hidden.indexOf(playername), 1);
}
} else {
    if (window.plugin.groupPlan.hidden.indexOf(playername) == -1) {

window.plugin.groupPlan.hidden.push(playername)

                for (var key in window.plugin.groupPlan.datalayer[playername]) {
                    var item = window.plugin.groupPlan.datalayer[playername][key]
                    window.plugin.groupPlan.layer.removeLayer(item)
                    
                    
                }


}

}

}

window.plugin.groupPlan.configsave = function(){
    localStorage['plugin-group-plan-url'] = window.plugin.groupPlan.url
localStorage['plugin-group-plan-username'] = window.plugin.groupPlan.username 
localStorage['plugin-group-plan-password'] = window.plugin.groupPlan.password
localStorage['plugin-group-plan-context'] = window.plugin.groupPlan.context
}

window.plugin.groupPlan.configload = function() {
  try {
    var dataStr = localStorage['plugin-group-plan-url'];
    if (dataStr != undefined) 
    {

        window.plugin.groupPlan.url = dataStr;
    }
    var dataStr = localStorage['plugin-group-plan-username'];
    if (dataStr != undefined) 
    {

        window.plugin.groupPlan.username = dataStr;
    }
    var dataStr = localStorage['plugin-group-plan-password'];
    if (dataStr != undefined) 
    {

        window.plugin.groupPlan.password= dataStr;
    }
    
    var dataStr = localStorage['plugin-group-plan-context'];
    if (dataStr != undefined) 
    {

        window.plugin.groupPlan.context = dataStr;
    }

  } catch(e) {
    console.warn('group-plan: failed to load data from localStorage: '+e);
  }
}



window.plugin.groupPlan.load = function(player){
    window.plugin.drawTools.import(window.plugin.groupPlan.cache['draws'][player]);
}

    window.plugin.groupPlan.selectors = function(){
        html = "<table>"
        for (var player in window.plugin.groupPlan.useruuidmapping) {
            if (window.plugin.groupPlan.hidden.indexOf(player)){
                checked = "checked"
            } else {
                checked = ""
            }
        html = html + "<tr><td style=\"background-color: "+window.plugin.groupPlan.stringToColour(player)+"; width: 20px\"><input style=\"background-color: "+window.plugin.groupPlan.stringToColour(player)+"; width: 20px\" onchange=\"window.plugin.groupPlan.updateHidden(this.value, this.checked)\" type=\"checkbox\" name=\"selected\" value=\""+player+"\" "+checked+"></td><td style=\"vertical-align: middle\">"+player+"</td><td> - <a href=\"javascript:window.plugin.groupPlan.load(\'"+player+"\')\"> Load</a></td></tr>"

}
html = html + "</table>"
         dialog({
      html: html,
      title: 'Group Plan Layers'
    });
    }

    window.plugin.groupPlan.setup = function() {
        window.plugin.groupPlan.context = PLAYER.nickname;
        window.plugin.groupPlan.url = "http://119.9.15.56:6529/";
       window.plugin.groupPlan.layer = new L.FeatureGroup()
        window.plugin.groupPlan.configload();
        window.addLayerGroup('Group Plan', window.plugin.groupPlan.layer, true);
        $('#toolbox').append('<a onclick="window.plugin.groupPlan.settings();return false;">Group Plan Opts</a>');
        $('#toolbox').append('<a onclick="window.plugin.groupPlan.selectors();return false;">Group Plan Layers</a>');
    }
    
    setup = window.plugin.groupPlan.setup;
    
    window.plugin.groupPlan.hidden = []
    window.plugin.groupPlan.useruuidmapping = {}
    window.plugin.groupPlan.cache = {}

    window.plugin.groupPlan.syncPlan = function(data){
        window.plugin.groupPlan.cache = data
        for (var player in data['users']) {
            var uuid = data['users'][player];
            if (window.plugin.groupPlan.useruuidmapping[player] != uuid) {
                console.log("update detected for " + player)
               
                window.plugin.groupPlan.useruuidmapping[player] = uuid
                if(typeof window.plugin.groupPlan.datalayer[player] === 'undefined'){
                    window.plugin.groupPlan.datalayer[player]=[]
                }
                for (var key in window.plugin.groupPlan.datalayer[player]) {
                    var item = window.plugin.groupPlan.datalayer[player][key]
                    window.plugin.groupPlan.layer.removeLayer(item)
                    
                    
                }
                window.plugin.groupPlan.datalayer[player]=[]
                 if (player != window.plugin.groupPlan.context && window.plugin.groupPlan.hidden.indexOf(player) == -1){
                    window.plugin.groupPlan.importdraw(player, data['draws'][player]);
                    
                }
            }
        }
        
        
        
    }
    
    
    
    
    window.plugin.groupPlan.stringToColour = function(str) {
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        var colour = '#';
        for (var i = 0; i < 3; i++) {
            var value = (hash >> (i * 8)) & 0xFF;
            colour += ('00' + value.toString(16)).substr(-2);
        }
        return colour;
    }
    
    window.plugin.groupPlan.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }
    
            window.plugin.groupPlan.username = ""
             window.plugin.groupPlan.password  = ""
    
    window.plugin.groupPlan.datalayer = {}
    
    window.plugin.groupPlan.importdraw = function(player, data) {
        
        $.each(data, function(index,item) {
            
            var layer = null;
            var extraOpt = {};
            item.color = window.plugin.groupPlan.stringToColour(player);
            extraOpt.color = window.plugin.groupPlan.stringToColour(player);
            
            switch(item.type) {
                case 'polyline':
                    layer = L.geodesicPolyline(item.latLngs, L.extend({},window.plugin.drawTools.lineOptions,extraOpt));
                    break;
                case 'polygon':
                    layer = L.geodesicPolygon(item.latLngs, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                    break;
                case 'circle':
                    layer = L.geodesicCircle(item.latLng, item.radius, L.extend({},window.plugin.drawTools.polygonOptions,extraOpt));
                    break;
                case 'marker':
                    var extraMarkerOpt = {};
                    if (item.color) extraMarkerOpt.icon = window.plugin.drawTools.getMarkerIcon(item.color);
                    layer = L.marker(item.latLng, L.extend({},window.plugin.drawTools.markerOptions,extraMarkerOpt));
                    break;
                default:
                    console.warn('unknown layer type "'+item.type+'" when loading draw tools layer');
                    break;
            }
            if (layer) {
                window.plugin.groupPlan.datalayer[player].push(layer);
                window.plugin.groupPlan.layer.addLayer(layer)
                window.plugin.groupPlan.layer.bringToBack()
                
            }
        });
        
        
    }
    
    window.plugin.groupPlan.updatereq = function (){
        window.plugin.groupPlan.configsave();
        if (window.plugin.groupPlan.url != ""){
        $.ajax({
            url: window.plugin.groupPlan.url,
            
            jsonp: "callback",
            
            dataType: "jsonp",
            username: window.plugin.groupPlan.username,
            password: window.plugin.groupPlan.password,
            data: 
            {o: localStorage['plugin-draw-tools-layer'],
             y: window.plugin.groupPlan.guid(),
             agentname: window.plugin.groupPlan.context},
            
            // work with the response
            success: function( response ) {
                console.log( response ); // server response
            }
        });
    }
    }
    
    window.setInterval(window.plugin.groupPlan.updatereq,2000);
    
    
    setup.info = plugin_info; //add the script info data to the function as a property
    if(!window.bootPlugins) window.bootPlugins = [];
    window.bootPlugins.push(setup);
    // if IITC has already booted, immediately run the 'setup' function
    if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
