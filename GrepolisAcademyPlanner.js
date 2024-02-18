// ==UserScript==
// @name         GrepolisAcademyPlanner
// @version      0.0.1
// @description  Grepolis Academy Planner
// @author       .Evil Knievel?
// @include      http://nl*.grepolis.com/game/*
// @include      https://nl*.grepolis.com/game/*
// @exclude      view-source://*
// @updateURL
// ==/UserScript==

const uw = unsafeWindow || window, $ = uw.jQuery;
const Research = {
    slinger:                BigInt(1) << BigInt(0),
    archer:                 BigInt(1) << BigInt(1),
    town_guard:             BigInt(1) << BigInt(2),
    hoplite:                BigInt(1) << BigInt(3),
    meteorology:            BigInt(1) << BigInt(4),
    espionage:              BigInt(1) << BigInt(5),
    booty_bpv:              BigInt(1) << BigInt(6),
    pottery:                BigInt(1) << BigInt(7),
    rider:                  BigInt(1) << BigInt(8),
    architecture:           BigInt(1) << BigInt(9),
    instructor:             BigInt(1) << BigInt(10),
    bireme:                 BigInt(1) << BigInt(11),
    building_crane:         BigInt(1) << BigInt(12),
    shipwright:             BigInt(1) << BigInt(13),
    colonize_ship:          BigInt(1) << BigInt(14),
    chariot:                BigInt(1) << BigInt(15),
    attack_ship:            BigInt(1) << BigInt(16),
    conscription:           BigInt(1) << BigInt(17),
    demolition_ship:        BigInt(1) << BigInt(18),
    catapult:               BigInt(1) << BigInt(19),
    cryptography:           BigInt(1) << BigInt(20),
    small_transporter:      BigInt(1) << BigInt(21),
    plow:                   BigInt(1) << BigInt(22),
    berth:                  BigInt(1) << BigInt(23),
    trireme:                BigInt(1) << BigInt(24),
    phalanx:                BigInt(1) << BigInt(25),
    breach:                 BigInt(1) << BigInt(26),
    mathematics:            BigInt(1) << BigInt(27),
    ram:                    BigInt(1) << BigInt(28),
    cartography:            BigInt(1) << BigInt(29),
    take_over:              BigInt(1) << BigInt(30),
    stone_storm:            BigInt(1) << BigInt(31),
    temple_looting:         BigInt(1) << BigInt(32),
    divine_selection:       BigInt(1) << BigInt(33),
    combat_experience:      BigInt(1) << BigInt(34),
    strong_wine:            BigInt(1) << BigInt(35),
    set_sail:               BigInt(1) << BigInt(36),
}
let townResearch = 0;

if ((uw.location.pathname.indexOf("game") >= 0)) 
{
    console.log("Grepolis Academy Planner active.");
    townResearch = BigInt(localStorage.getItem("GAP_" + Game.townId) ?? 0);

    $("head").append($("<style/>").append(".GAP_highlight::after { content: ''; position: absolute; width: 100%; height: 100%; background-color: rgba(0, 255, 0, 0.5); }"));

    $.Observer(uw.GameEvents.game.load).subscribe("GAP_load", function (e, data) 
    {
        $(document).ajaxComplete(function (e, xhr, opt) 
        {
            let url = opt.url.split("?"), action = "";
            if (typeof (url[1]) !== "undefined" && typeof (url[1].split(/&/)[1]) !== "undefined") 
            {
                action = url[0].substr(5) + "/" + url[1].split(/&/)[1].substr(7);
            }

            switch (action) 
            {
                case "/frontend_bridge/fetch":
					var frontend_bridge = decodeURIComponent(url[1].split("&")[3]).split("\"")[3];
                    switch (frontend_bridge) {
                        case "academy":
                            var wnd = WM.getWindowByType("academy")[0];
                            OpenAcademy(wnd);
                            break;
                    }

					break;
                case "/notify/fetch":
                    var wnd = (WM.getWindowByType("academy"))[0];
                    if (wnd) {
                        OpenAcademy(wnd);
                    }

                    break;
            }
        });
    });

    $.Observer(GameEvents.window.open).subscribe("GAP_window_open", function(e, wnd) 
    {
        if (!wnd.cid) return;
        
        switch (wnd.getType()) 
        {
            case "academy":
                OpenAcademy(wnd);
                break;
        }
    });

    function OpenAcademy(wnd) 
    {
        $("#window_" + wnd.getIdentifier()).ready(function() 
        {
            var tech_tree = $("#window_" + wnd.getIdentifier()).find("div.tech_tree_box");
            tech_tree.find("div.research").each(function(index, element) 
            {
                var classes = $(element).attr("class").split(/\s+/);
                var research = classes[2];
                var inactive = classes[3] === "inactive";
                $(element).click(function()
                {
                    ToggleResearch(research);
                    ToggleClass(element);
                });

                if (BigInt(townResearch & Research[research]) === Research[research] && inactive) 
                {
                    AddClass(element);
                }
            });
        });
    }

    function ResetAcademy() {
        var wnd = WM.getWindowByType("academy")[0];
        if (wnd) 
        {
            var tech_tree = $("#window_" + wnd.getIdentifier()).find("div.tech_tree_box");
            tech_tree.find("div.research").each(function(index, element) 
            {
                $(element).removeClass("GAP_highlight");
            });

            OpenAcademy(wnd);
        }
    }
    
    function ToggleResearch(research)
    {
        townResearch = townResearch ^ Research[research];
        localStorage.setItem("GAP_" + Game.townId, townResearch);
    }

    function AddClass(element)
    {
        $(element).addClass("GAP_highlight");
    }

    function RemoveClass(element)
    {
        $(element).removeClass("GAP_highlight");
    }

    function ToggleClass(element)
    {
        var classes = $(element).attr("class").split(/\s+/);
        if (classes[3] !== "inactive")
        {
            return;
        }

        if (classes.length === 5)
        {
            RemoveClass(element);
        }
        else
        {
            AddClass(element);
        }
    }

    $.Observer(GameEvents.town.town_switch).subscribe("GAP_town_switch", function() 
    {
        townResearch = BigInt(localStorage.getItem("GAP_" + Game.townId) ?? 0);
        ResetAcademy();
    });
}