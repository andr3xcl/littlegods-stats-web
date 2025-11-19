#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\zombies\_zm;


#include scripts\zm\chat;
#include scripts\zm\data;
#include scripts\zm\finish;



init()
{
    level thread onPlayerConnect();
    level thread onPlayerSay();
}
onPlayerConnect()
{

    self endon("disconnect");
    for (;;)
    {
        level waittill("connected", player);
        player thread onPlayerSpawned();
        
    }
}

onPlayerSpawned()
{
    level endon("game_ended");
    self endon("disconnect");

    for (;;)
    {
        self waittill("spawned_player");
        
        self.valuelang = 1; 

        
        self thread save_player_guid();
        self thread finish();
    }
}

save_player_guid()
{
    self endon("disconnect");

    
    wait 1;

    if (!isDefined(self.name) || self.name == "")
        return;

    
    safe_name = self.name;

    
    safe_name = replace_string(safe_name, " ", "_");
    safe_name = replace_string(safe_name, "[", "");
    safe_name = replace_string(safe_name, "]", "");
    safe_name = replace_string(safe_name, "{", "");
    safe_name = replace_string(safe_name, "}", "");
    safe_name = replace_string(safe_name, "(", "");
    safe_name = replace_string(safe_name, ")", "");
    safe_name = replace_string(safe_name, "<", "");
    safe_name = replace_string(safe_name, ">", "");
    safe_name = replace_string(safe_name, "|", "");
    safe_name = replace_string(safe_name, ":", "");
    safe_name = replace_string(safe_name, "*", "");
    safe_name = replace_string(safe_name, "?", "");
    safe_name = replace_string(safe_name, "\"", "");
    safe_name = replace_string(safe_name, "'", "");

    filename = "guids/" + safe_name + ".txt";

    
    file = fs_fopen(filename, "write");
    if (isDefined(file))
    {
        guid = self getGuid();
        fs_write(file, guid);
        fs_fclose(file);
    }
}

replace_string(str, find, replace)
{
    result = "";
    for (i = 0; i < str.size; i++)
    {
        char = str[i];
        if (char == find)
            result += replace;
        else
            result += char;
    }
    return result;
}