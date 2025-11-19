#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm;










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





get_bank_balance(player)
{
    player_id = player getGuid();

    return get_bank_balance_with_id(player_id);
}


bank_deposit(player, amount)
{
    if (!isDefined(amount) || amount <= 0)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1Cantidad inválida");
        else
            player iPrintlnBold("^1Invalid amount");
        return;
    }

    if (player.score < amount)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1No tienes suficientes puntos");
        else
            player iPrintlnBold("^1Not enough points");
        return;
    }

    player_id = player getGuid();
    filename = "bank/" + player_id + ".txt";

    current_balance = get_bank_balance_with_id(player_id);
    new_balance = current_balance + amount;

    player.score -= amount;

    file = fs_fopen(filename, "write");

    if (!isDefined(file))
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1Error al acceder al banco");
        else
            player iPrintlnBold("^1Error accessing bank");
        
        player.score += amount;
        return;
    }

    current_time = getTime();

    
    fs_write(file, "================================\n");
    fs_write(file, "CUENTA BANCARIA\n");
    fs_write(file, "================================\n");
    fs_write(file, "Jugador: " + player.name + "\n");
    fs_write(file, "ID: " + player_id + "\n");
    if (player.valuelang == 0)
        fs_write(file, "Ultima Transaccion: Deposito de " + amount + " puntos\n");
    else
        fs_write(file, "Last Transaction: Deposit of " + amount + " points\n");
    fs_write(file, "Fecha/Hora: " + current_time + "\n");
    fs_write(file, "Balance: " + new_balance + "\n");
    fs_write(file, "================================\n");

    fs_fclose(file);

    if (player.valuelang == 0)
        player iPrintlnBold("^2Depositaste ^7" + amount + "^2 puntos. Balance: ^7" + new_balance);
    else
        player iPrintlnBold("^2Deposited ^7" + amount + "^2 points. Balance: ^7" + new_balance);
}



get_player_guid_by_name(player_name)
{
    
    foreach (player in level.players)
    {
        if (isDefined(player) && isDefined(player.name) &&
            toLower(player.name) == toLower(player_name))
        {
            return player getGuid();
        }
    }

    
    
    safe_name = player_name;

    
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

    if (fs_testfile(filename))
    {
        file = fs_fopen(filename, "read");
        if (isDefined(file))
        {
            file_size = fs_length(file);
            guid = fs_read(file, file_size);
            fs_fclose(file);

            
            guid = replace_string(guid, "\n", "");
            guid = replace_string(guid, "\r", "");

            return guid;
        }
    }

    return undefined;
}

get_bank_balance_with_id(player_id)
{
    filename = "bank/" + player_id + ".txt"; 

    if (!fs_testfile(filename))
    {
        return 0;
    }

    file = fs_fopen(filename, "read");

    if (!isDefined(file))
    {
        return 0;
    }

    file_size = fs_length(file);
    content = fs_read(file, file_size);
    fs_fclose(file);

    lines = strTok(content, "\n");
    for (i = 0; i < lines.size; i++)
    {
        line = lines[i];
        if (isSubStr(line, "Balance: "))
        {
            balance_str = getSubStr(line, 9); 
            return int(balance_str);
        }
    }

    return 0;
}


bank_deposit_all(player)
{
    amount = player.score;

    if (amount <= 0)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1No tienes puntos para depositar");
        else
            player iPrintlnBold("^1No points to deposit");
        return;
    }

    bank_deposit(player, amount);
}


bank_withdraw(player, amount)
{
    if (!isDefined(amount) || amount <= 0)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1Cantidad inválida");
        else
            player iPrintlnBold("^1Invalid amount");
        return;
    }

    
    player_id = player getGuid();

    
    current_balance = get_bank_balance_with_id(player_id);

    if (current_balance < amount)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1No tienes suficientes puntos en el banco");
        else
            player iPrintlnBold("^1Not enough points in bank");
        return;
    }

    filename = "bank/" + player_id + ".txt";

    
    new_balance = current_balance - amount;

    
    player.score += amount;

    
    file = fs_fopen(filename, "write");

    if (!isDefined(file))
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1Error al acceder al banco");
        else
            player iPrintlnBold("^1Error accessing bank");
        
        player.score -= amount;
        return;
    }

    
    current_time = getTime();

    
    fs_write(file, "================================\n");
    fs_write(file, "CUENTA BANCARIA\n");
    fs_write(file, "================================\n");
    fs_write(file, "Jugador: " + player.name + "\n");
    fs_write(file, "ID: " + player_id + "\n");
    if (player.valuelang == 0)
        fs_write(file, "Ultima Transaccion: Retiro de " + amount + " puntos\n");
    else
        fs_write(file, "Last Transaction: Withdrawal of " + amount + " points\n");
    fs_write(file, "Fecha/Hora: " + current_time + "\n");
    fs_write(file, "Balance: " + new_balance + "\n");
    fs_write(file, "================================\n");

    fs_fclose(file);

    if (player.valuelang == 0)
        player iPrintlnBold("^2Retiraste ^7" + amount + "^2 puntos. Balance restante: ^7" + new_balance);
    else
        player iPrintlnBold("^2Withdrew ^7" + amount + "^2 points. Remaining balance: ^7" + new_balance);
}


bank_withdraw_all(player)
{
    
    player_id = player getGuid();

    current_balance = get_bank_balance_with_id(player_id);

    if (current_balance <= 0)
    {
        if (player.valuelang == 0)
            player iPrintlnBold("^1No tienes puntos en el banco");
        else
            player iPrintlnBold("^1No points in bank");
        return;
    }

    bank_withdraw(player, current_balance);
}


bank_pay_player(payer, receiver_name, amount)
{
    if (!isDefined(amount) || amount <= 0)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1Cantidad inválida");
        else
            payer iPrintlnBold("^1Invalid amount");
        return;
    }

    if (payer.score < amount)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1No tienes suficientes puntos");
        else
            payer iPrintlnBold("^1Not enough points");
        return;
    }

    
    receiver = undefined;
    foreach (player in level.players)
    {
        if (isDefined(player) && isDefined(player.name) &&
            toLower(player.name) == toLower(receiver_name))
        {
            receiver = player;
            break;
        }
    }

    if (!isDefined(receiver))
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1Jugador '" + receiver_name + "' no encontrado");
        else
            payer iPrintlnBold("^1Player '" + receiver_name + "' not found");
        return;
    }

    if (receiver == payer)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1No puedes pagarte a ti mismo");
        else
            payer iPrintlnBold("^1You can't pay yourself");
        return;
    }

    
    payer.score -= amount;
    receiver.score += amount;

    
    if (payer.valuelang == 0)
    {
        payer iPrintlnBold("^2Pagaste ^7" + amount + "^2 puntos a ^7" + receiver.name);
        receiver iPrintlnBold("^3Recibiste ^7" + amount + "^3 puntos de ^7" + payer.name);
    }
    else
    {
        payer iPrintlnBold("^2Paid ^7" + amount + "^2 points to ^7" + receiver.name);
        receiver iPrintlnBold("^3Received ^7" + amount + "^3 points from ^7" + payer.name);
    }
}


bank_pay_to_guid(payer, target_guid, amount)
{
    if (!isDefined(amount) || amount <= 0)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1Cantidad inválida");
        else
            payer iPrintlnBold("^1Invalid amount");
        return;
    }

    if (payer.score < amount)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1No tienes suficientes puntos");
        else
            payer iPrintlnBold("^1Not enough points");
        return;
    }

    
    payer_guid_str = "" + payer getGuid();
    target_guid_str = "" + target_guid;
    if (target_guid_str == payer_guid_str)
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1No puedes depositar a tu propio banco");
        else
            payer iPrintlnBold("^1You can't deposit to your own bank");
        return;
    }

    
    filename = "bank/" + target_guid + ".txt";
    if (!fs_testfile(filename))
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1El banco del jugador no existe");
        else
            payer iPrintlnBold("^1Player's bank doesn't exist");
        return;
    }

    
    existing_file = fs_fopen(filename, "read");
    if (!isDefined(existing_file))
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1Error al acceder al banco del jugador");
        else
            payer iPrintlnBold("^1Error accessing player's bank");
        return;
    }

    file_size = fs_length(existing_file);
    content = fs_read(existing_file, file_size);
    fs_fclose(existing_file);

    
    player_name = "Jugador " + target_guid; 
    lines = strTok(content, "\n");
    for (i = 0; i < lines.size; i++)
    {
        line = lines[i];
        if (isSubStr(line, "Jugador: "))
        {
            player_name = getSubStr(line, 9); 
            break;
        }
    }

    
    current_balance = get_bank_balance_with_id(target_guid);
    new_balance = current_balance + amount;

    
    file = fs_fopen(filename, "write");
    if (isDefined(file))
    {
        fs_write(file, "================================\n");
        fs_write(file, "CUENTA BANCARIA\n");
        fs_write(file, "================================\n");
        fs_write(file, "Jugador: " + player_name + "\n");
        fs_write(file, "ID: " + target_guid + "\n");
        fs_write(file, "Ultima Transaccion: Deposito desde " + payer.name + " de " + amount + " puntos\n");
        fs_write(file, "Fecha/Hora: " + getTime() + "\n");
        fs_write(file, "Balance: " + new_balance + "\n");
        fs_write(file, "================================\n");
        fs_fclose(file);
    }
    else
    {
        if (payer.valuelang == 0)
            payer iPrintlnBold("^1Error al guardar en el banco del jugador");
        else
            payer iPrintlnBold("^1Error saving to player's bank");
        return;
    }

    
    payer.score -= amount;

    
    if (payer.valuelang == 0)
        payer iPrintlnBold("^2Depositaste ^7" + amount + "^2 puntos al banco de ^7" + player_name);
    else
        payer iPrintlnBold("^2Deposited ^7" + amount + "^2 points to ^7" + player_name + "'s bank");
}





init_weapon_tracking(player)
{
    if (!isDefined(player.weapon_kills))
    {
        player.weapon_kills = [];
    }

    player thread track_weapon_kills_callback();
}

track_weapon_kills_callback()
{
    self endon("disconnect");
    level endon("end_game");

    wait 1;

    self.weapon_tracking_last_kills = 0;
    if (isDefined(self.pers["kills"]))
        self.weapon_tracking_last_kills = self.pers["kills"];

    while (true)
    {
        wait 0.05;

        current_kills = 0;
        if (isDefined(self.pers["kills"]))
            current_kills = self.pers["kills"];

        if (current_kills > self.weapon_tracking_last_kills)
        {
            current_weapon = self getCurrentWeapon();

            if (!isDefined(current_weapon) || current_weapon == "none" || current_weapon == "")
            {
                if (isDefined(self.primaryweapon) && self.primaryweapon != "none")
                    current_weapon = self.primaryweapon;
                else if (isDefined(self.secondaryweapon) && self.secondaryweapon != "none")
                    current_weapon = self.secondaryweapon;
            }

            if (isDefined(current_weapon) && current_weapon != "none" && current_weapon != "")
            {
                if (!isDefined(self.weapon_kills[current_weapon]))
                {
                    self.weapon_kills[current_weapon] = 0;
                }

                kills_diff = current_kills - self.weapon_tracking_last_kills;
                self.weapon_kills[current_weapon] += kills_diff;
            }

            self.weapon_tracking_last_kills = current_kills;
        }
    }
}

get_most_used_weapon(player)
{
    if (!isDefined(player.weapon_kills) || player.weapon_kills.size == 0)
        return "None";

    most_used = "None";
    max_kills = 0;

    foreach (weapon_name, kill_count in player.weapon_kills)
    {
        if (kill_count > max_kills)
        {
            max_kills = kill_count;
            most_used = weapon_name;
        }
    }

    if (most_used != "None")
    {
        most_used = format_weapon_name(most_used);
    }

    return most_used + " (" + max_kills + " kills)";
}

get_all_weapons_used(player)
{
    if (!isDefined(player.weapon_kills) || player.weapon_kills.size == 0)
        return undefined;

    weapons_used = [];
    foreach (weapon_name, kill_count in player.weapon_kills)
    {
        if (kill_count > 0)
        {
            weapons_used[weapon_name] = kill_count;
        }
    }

    return weapons_used;
}

format_weapon_name(weapon_name)
{
    return weapon_name;
}





init_perks_tracking(player)
{
    if (!isDefined(player.perks_used))
    {
        player.perks_used = [];
    }

    perk_names = [];
    perk_names[0] = "specialty_armorvest";
    perk_names[1] = "specialty_quickrevive";
    perk_names[2] = "specialty_fastreload";
    perk_names[3] = "specialty_rof";
    perk_names[4] = "specialty_longersprint";
    perk_names[5] = "specialty_flakjacket";
    perk_names[6] = "specialty_deadshot";
    perk_names[7] = "specialty_additionalprimaryweapon";
    perk_names[8] = "specialty_grenadepulldeath";
    perk_names[9] = "specialty_finalstand";

    foreach (perk_name in perk_names)
    {
        if (!isDefined(player.perks_used[perk_name]))
        {
            player.perks_used[perk_name] = 0;
        }
    }

    player thread track_perks_usage_callback();
}

get_perk_display_name(perk_name)
{
    switch (perk_name)
    {
        case "specialty_armorvest": return "Juggernog";
        case "specialty_quickrevive": return "Quick Revive";
        case "specialty_fastreload": return "Speed Cola";
        case "specialty_rof": return "Double Tap";
        case "specialty_longersprint": return "Stamin-Up";
        case "specialty_flakjacket": return "PhD Flopper";
        case "specialty_deadshot": return "Deadshot Daiquiri";
        case "specialty_additionalprimaryweapon": return "Mule Kick";
        case "specialty_grenadepulldeath": return "Electric Cherry";
        case "specialty_finalstand": return "Who's Who";
        default: return perk_name;
    }
}

track_perks_usage_callback()
{
    self endon("disconnect");
    level endon("end_game");

    wait 2;

    perk_list = [];
    perk_list[0] = "specialty_armorvest";
    perk_list[1] = "specialty_quickrevive";
    perk_list[2] = "specialty_fastreload";
    perk_list[3] = "specialty_rof";
    perk_list[4] = "specialty_longersprint";
    perk_list[5] = "specialty_flakjacket";
    perk_list[6] = "specialty_deadshot";
    perk_list[7] = "specialty_additionalprimaryweapon";
    perk_list[8] = "specialty_grenadepulldeath";
    perk_list[9] = "specialty_finalstand";

    while (true)
    {
        wait 1;

        foreach (perk_name in perk_list)
        {
            if (self hasPerk(perk_name))
            {
                if (!isDefined(self.perks_used[perk_name]) || self.perks_used[perk_name] == 0)
                {
                    if (!isDefined(self.perks_used[perk_name]))
                    {
                        self.perks_used[perk_name] = 0;
                    }
                    self.perks_used[perk_name] = 1;
                }
            }
        }
    }
}

get_all_perks_used(player)
{
    if (!isDefined(player.perks_used) || player.perks_used.size == 0)
        return undefined;

    perks_used = [];
    foreach (perk_name, obtained in player.perks_used)
    {
        if (obtained > 0)
        {
            perks_used[perk_name] = obtained;
        }
    }

    return perks_used;
}






save_recent_match(player, map_name, round_number, kills, headshots, revives, downs, score, most_used_weapon, all_weapons_data, all_perks_data)
{
    
    player_guid = player getGuid();

    
    directory = "scriptdata/recent/" + player_guid + "/";

    
    next_match_number = get_next_recent_match_number(player_guid, map_name);

    
    filename = directory + map_name + "_recent_" + next_match_number + ".txt";

    
    update_match_index(player_guid, map_name, next_match_number);

    file = fs_fopen(filename, "write");

    if (!isDefined(file))
    {
        self iPrintlnBold("^1Error: No se pudo crear archivo de partida reciente");
        return;
    }

    
    player_name = player.name;
    if (!isDefined(player_name) || player_name == "")
        player_name = "Unknown Player";

    current_time = getTime();

    
    fs_write(file, "================================\n");
    fs_write(file, "PARTIDA RECIENTE #" + next_match_number + "\n");
    fs_write(file, "================================\n");
    fs_write(file, "Jugador: " + player_name + "\n");
    fs_write(file, "GUID: " + player_guid + "\n");
    fs_write(file, "Mapa: " + map_name + "\n");
    fs_write(file, "Ronda Alcanzada: " + round_number + "\n");
    fs_write(file, "\n");
    fs_write(file, "ESTADISTICAS DE LA PARTIDA:\n");
    fs_write(file, "Kills: " + kills + "\n");
    fs_write(file, "Headshots: " + headshots + "\n");
    fs_write(file, "Revives: " + revives + "\n");
    fs_write(file, "Downs: " + downs + "\n");
    fs_write(file, "Score Total: " + score + "\n");
    fs_write(file, "Arma Mas Usada: " + most_used_weapon + "\n");

    if (isDefined(all_weapons_data) && all_weapons_data.size > 0)
    {
        fs_write(file, "\nARMAS USADAS EN LA PARTIDA:\n");

        weapons_sorted = [];
        foreach (weapon_name, kill_count in all_weapons_data)
        {
            weapons_sorted[weapons_sorted.size] = weapon_name + ":" + kill_count;
        }

        for (i = 0; i < weapons_sorted.size - 1; i++)
        {
            for (j = i + 1; j < weapons_sorted.size; j++)
            {
                weapon_i = strTok(weapons_sorted[i], ":");
                weapon_j = strTok(weapons_sorted[j], ":");

                kills_i = int(weapon_i[1]);
                kills_j = int(weapon_j[1]);

                if (kills_j > kills_i)
                {
                    temp = weapons_sorted[i];
                    weapons_sorted[i] = weapons_sorted[j];
                    weapons_sorted[j] = temp;
                }
            }
        }

        for (i = 0; i < weapons_sorted.size; i++)
        {
            weapon_data = strTok(weapons_sorted[i], ":");
            weapon_name = weapon_data[0];
            kill_count = weapon_data[1];
            fs_write(file, weapon_name + ": " + kill_count + " kills\n");
        }
    }

    if (isDefined(all_perks_data) && all_perks_data.size > 0)
    {
        fs_write(file, "\nPERKS USADOS EN LA PARTIDA:\n");

        foreach (perk_name, obtained_count in all_perks_data)
        {
            perk_display_name = get_perk_display_name(perk_name);
            fs_write(file, perk_display_name + ": " + obtained_count + " uso" + (obtained_count > 1 ? "s" : "") + "\n");
        }
    }

    fs_write(file, "\n");
    fs_write(file, "Fecha/Hora: " + current_time + "\n");
    fs_write(file, "================================\n");

    fs_fclose(file);

    
    if (isDefined(player) && isPlayer(player))
    {
        player iPrintlnBold("^2Partida reciente guardada (#" + next_match_number + ")");
    }
}


get_next_recent_match_number(player_guid, map_name)
{
    
    index_filename = "scriptdata/recent/" + player_guid + "/" + map_name + "_index.txt";

    if (!fs_testfile(index_filename))
    {
        
        return 1;
    }

    
    file = fs_fopen(index_filename, "read");
    if (!isDefined(file))
    {
        return 1; 
    }

    file_size = fs_length(file);
    content = fs_read(file, file_size);
    fs_fclose(file);

    
    last_number = int(content);

    
    return last_number + 1;
}


update_match_index(player_guid, map_name, match_number)
{
    index_filename = "scriptdata/recent/" + player_guid + "/" + map_name + "_index.txt";

    file = fs_fopen(index_filename, "write");
    if (!isDefined(file))
    {
        
        
        return;
    }

    
    fs_write(file, "" + match_number);
    fs_fclose(file);
}


show_recent_matches(player, map_name)
{
    player_guid = player getGuid();

    
    index_filename = "scriptdata/recent/" + player_guid + "/" + map_name + "_index.txt";

    if (!fs_testfile(index_filename))
    {
        
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintlnBold("^3No hay partidas recientes en " + get_map_display_name(map_name));
        else
            player iPrintlnBold("^3No recent matches in " + get_map_display_name(map_name));
        return;
    }

    
    file = fs_fopen(index_filename, "read");
    if (!isDefined(file))
    {
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintlnBold("^3No hay partidas recientes en " + get_map_display_name(map_name));
        else
            player iPrintlnBold("^3No recent matches in " + get_map_display_name(map_name));
        return;
    }

    file_size = fs_length(file);
    content = fs_read(file, file_size);
    fs_fclose(file);

    last_match_number = int(content);

    
    files = [];
    for (i = last_match_number; i > 0 && files.size < 5; i--)
    {
        filename = "scriptdata/recent/" + player_guid + "/" + map_name + "_recent_" + i + ".txt";
        if (fs_testfile(filename))
        {
            files[files.size] = map_name + "_recent_" + i + ".txt";
        }
    }

    if (!isDefined(files) || files.size == 0)
    {
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintlnBold("^3No hay partidas recientes en " + get_map_display_name(map_name));
        else
            player iPrintlnBold("^3No recent matches in " + get_map_display_name(map_name));
        return;
    }

    
    if (isDefined(player.langLEN) && player.langLEN == 0)
        player iPrintlnBold("^6=== PARTIDAS RECIENTES: " + get_map_display_name(map_name) + " (" + files.size + ") ===");
    else
        player iPrintlnBold("^6=== RECENT MATCHES: " + get_map_display_name(map_name) + " (" + files.size + ") ===");

    
    display_count = min(files.size, 5);

    for (i = 0; i < display_count; i++)
    {
        filename = "scriptdata/recent/" + player_guid + "/" + files[i];

        if (!fs_testfile(filename))
            continue;

        file = fs_fopen(filename, "read");
        if (!isDefined(file))
            continue;

        file_size = fs_length(file);
        content = fs_read(file, file_size);
        fs_fclose(file);

        
        lines = strTok(content, "\n");
        round_info = "";
        score_info = "";
        time_info = "";

        foreach (line in lines)
        {
            if (isSubStr(line, "Ronda Alcanzada:"))
            {
                round_info = getSubStr(line, 16);
            }
            else if (isSubStr(line, "Score Total:"))
            {
                score_info = getSubStr(line, 12);
            }
            else if (isSubStr(line, "Fecha/Hora:"))
            {
                time_info = getSubStr(line, 11);
            }
        }

        wait 0.2; 

        
        parts = strTok(files[i], "_");
        match_num = int(getSubStr(parts[2], 0, parts[2].size - 4));

        if (isDefined(player.langLEN) && player.langLEN == 0)
        {
            player iPrintln("^7#" + match_num + " ^2Ronda: ^7" + round_info + " ^3Score: ^7" + score_info);
        }
        else
        {
            player iPrintln("^7#" + match_num + " ^2Round: ^7" + round_info + " ^3Score: ^7" + score_info);
        }
    }

    if (files.size > 5)
    {
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintln("^8... y " + (files.size - 5) + " más");
        else
            player iPrintln("^8... and " + (files.size - 5) + " more");
    }
}


show_recent_match_details(player, map_name, match_number)
{
    player_guid = player getGuid();
    filename = "scriptdata/recent/" + player_guid + "/" + map_name + "_recent_" + match_number + ".txt";

    if (!fs_testfile(filename))
    {
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintlnBold("^3Partida reciente #" + match_number + " no encontrada");
        else
            player iPrintlnBold("^3Recent match #" + match_number + " not found");
        return;
    }

    file = fs_fopen(filename, "read");

    if (!isDefined(file))
    {
        if (isDefined(player.langLEN) && player.langLEN == 0)
            player iPrintlnBold("^1Error al leer partida reciente");
        else
            player iPrintlnBold("^1Error reading recent match");
        return;
    }

    file_size = fs_length(file);
    content = fs_read(file, file_size);
    fs_fclose(file);

    
    if (isDefined(player.langLEN) && player.langLEN == 0)
        player iPrintlnBold("^6=== DETALLES PARTIDA RECIENTE #" + match_number + " ===");
    else
        player iPrintlnBold("^6=== RECENT MATCH DETAILS #" + match_number + " ===");

    
    lines = strTok(content, "\n");

    foreach (line in lines)
    {
        if (line != "")
        {
            wait 0.1; 
            player iPrintln("^7" + line);
        }
    }
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
