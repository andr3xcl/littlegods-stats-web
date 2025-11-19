#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm_utility;
#include maps\mp_utility;
#include common_scripts\utility;
#include scripts\zm\data;






finish()
{
    self endon("disconnect");

    
    if (isDefined(level.stats_system_initialized))
        return;

    level.stats_system_initialized = true;

    
    level.current_game_map = getDvar("ui_zm_mapstartlocation");

    
    init_weapon_tracking_for_all_players();

    
    level thread monitor_new_players_for_weapon_tracking();

    
    level waittill("end_game");

    
    process_all_players_stats();
}


process_all_players_stats()
{
    round_reached = level.round_number;

    foreach (player in level.players)
    {
        if (isDefined(player) && isPlayer(player))
        {
            
            if (isDefined(player.developer_mode_unlocked) && player.developer_mode_unlocked)
            {
                continue; 
            }

            
            if (!isDefined(player.stats_processed) || !player.stats_processed)
            {
                player.stats_processed = true;
                player thread process_single_player_stats(level.current_game_map, round_reached);
            }
        }
    }

    
    
    foreach (player in level.players)
    {
        if (isDefined(player) && isPlayer(player) && (!isDefined(player.developer_mode_unlocked) || !player.developer_mode_unlocked))
        {
            player thread execute_map_end_effects(level.current_game_map);
            break; 
        }
    }

    
    if (!isDefined(level.effects_executed))
    {
        level.effects_executed = true;
        if (isDefined(level.players[0]))
        {
            level.players[0] thread execute_map_end_effects(level.current_game_map);
        }
    }
}


init_weapon_tracking_for_all_players()
{
    foreach (player in level.players)
    {
        if (isDefined(player) && isPlayer(player))
        {
            if (!isDefined(player.weapon_kills))
            {
                scripts\zm\data::init_weapon_tracking(player);
            }
            if (!isDefined(player.perks_used))
            {
                scripts\zm\data::init_perks_tracking(player);
            }
        }
    }
}


monitor_new_players_for_weapon_tracking()
{
    level endon("end_game");

    while (true)
    {
        level waittill("connected", player);

        if (isDefined(player) && isPlayer(player))
        {
            player waittill("spawned_player");

            if (!isDefined(player.weapon_kills))
            {
                scripts\zm\data::init_weapon_tracking(player);
            }
            if (!isDefined(player.perks_used))
            {
                scripts\zm\data::init_perks_tracking(player);
            }
        }
    }
}


process_single_player_stats(current_map, round_reached)
{
    
    if (!isDefined(self.weapon_kills))
    {
        scripts\zm\data::init_weapon_tracking(self);
    }
    if (!isDefined(self.perks_used))
    {
        scripts\zm\data::init_perks_tracking(self);
    }

    
    self thread collect_game_stats();

    
    self waittill("stats_collected");

    
    kills = isDefined(self.game_kills) ? self.game_kills : 0;
    headshots = isDefined(self.game_headshots) ? self.game_headshots : 0;
    revives = isDefined(self.game_revives) ? self.game_revives : 0;
    downs = isDefined(self.game_downs) ? self.game_downs : 0;
    total_score = isDefined(self.score) ? self.score : 0;

    
    most_used_weapon = scripts\zm\data::get_most_used_weapon(self);
    all_weapons_data = scripts\zm\data::get_all_weapons_used(self);
    all_perks_data = scripts\zm\data::get_all_perks_used(self);

    
    scripts\zm\data::save_recent_match(self, current_map, round_reached, kills, headshots, revives, downs, total_score, most_used_weapon, all_weapons_data, all_perks_data);

    
    if (isDefined(self.langLEN) && self.langLEN == 0) 
    {
        self iPrintlnBold("^2Partida guardada - Ronda: ^7" + round_reached + " ^2en ^7" + get_map_display_name(current_map));
    }
    else 
    {
        self iPrintlnBold("^2Match saved - Round: ^7" + round_reached + " ^2in ^7" + get_map_display_name(current_map));
    }
}


collect_game_stats()
{
    self.game_kills = 0;
    self.game_headshots = 0;
    self.game_revives = 0;
    self.game_downs = 0;

    
    if (isDefined(self.pers["kills"]))
        self.game_kills = self.pers["kills"];

    
    if (isDefined(self.pers["headshots"]))
        self.game_headshots = self.pers["headshots"];

    
    if (isDefined(self.pers["revives"]))
        self.game_revives = self.pers["revives"];

    
    if (isDefined(self.pers["downs"]))
        self.game_downs = self.pers["downs"];

    wait 0.5;
    self notify("stats_collected");
}


get_map_display_name(map_code)
{
    switch (map_code)
    {
        case "tomb": return "Origins";
        case "transit": return "Transit";
        case "processing": return "Buried";
        case "prison": return "Mob of the Dead";
        case "nuked": return "Nuketown";
        case "highrise": return "Die Rise";
        default: return map_code;
    }
}


execute_map_end_effects(map_code)
{
    trace = (0, 0, 3000);

    switch (map_code)
    {
        case "tomb": 
            earthquake(0.9, 15, (0, 0, 0), 100000);
            foreach (player in level.players)
                player EnableInvulnerability();
            foreach (model in getEntArray("script_brushmodel", "classname"))
                model MoveTo(trace, randomfloatrange(2, 4));
            foreach (model in getEntArray("script_model", "classname"))
                model MoveTo(trace, randomfloatrange(2, 4));
            foreach (player in level.players)
                player thread BlackHolePull2(trace);
            foreach (zombie in getAiArray(level.zombie_team))
                zombie forceteleport(trace, self.angles + vectorScale((0, 1, 0), 180));
            wait 3;
            playfx(loadfx("explosions/fx_default_explosion"), trace);
            playfx(loadFx("misc/fx_zombie_mini_nuke_hotness"), trace);
            foreach (model in getEntArray("script_brushmodel", "classname"))
                    model Delete();
            foreach (model in getEntArray("script_model", "classname"))
                    model Delete();
            wait 0.1;
            foreach (player in level.players)
            {
                player DisableInvulnerability();
                RadiusDamage(trace, 500, 99999, 99999, player);
            }
            break;

        case "transit": 
            earthquake(0.6, 10, (0, 0, 0), 50000);
            foreach (player in level.players)
                player EnableInvulnerability();
            wait 2;
            foreach (player in level.players)
                player DisableInvulnerability();
            break;

        case "processing": 
            earthquake(0.7, 12, (0, 0, 0), 75000);
            foreach (player in level.players)
                player EnableInvulnerability();
            wait 2;
            foreach (player in level.players)
                player DisableInvulnerability();
            break;

        case "prison": 
            earthquake(0.5, 8, (0, 0, 0), 25000);
            wait 1;
            break;

        default: 
            earthquake(0.4, 6, (0, 0, 0), 20000);
            wait 1;
            break;
    }

    level notify("end_game");
}


BlackHolePull2(trace)
{
    
    self setOrigin(trace);
}