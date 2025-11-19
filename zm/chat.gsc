#include maps\mp\_utility;
#include common_scripts\utility;
#include maps\mp\gametypes_zm\_hud_util;
#include maps\mp\zombies\_zm_utility;
#include maps\mp\zombies\_zm;
#include maps\mp\zombies\_zm_laststand;


#include scripts\zm\data;
#include scripts\zm\main;
#include scripts\zm\weapon;


onPlayerSay()
{
    level endon("end_game");
    prefix_bank = "#";
    prefix_weapon = "$";
    for (;;)
    {
        level waittill("say", message, player);
        message = toLower(message);
        guild_name = player getGuid();

        
        if (!level.intermission && message[0] == prefix_bank)
        {
            args = strtok(message, " ");
            command = getSubStr(args[0], 1);
            switch (command)
            {
            case "deposit":
            case "dep":
            case "d":
                if (isDefined(args[1]))
                {
                    amount = int(args[1]);
                    if (amount > 0)
                    {
                        bank_deposit(player, amount);
                    }
                    else
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("Cantidad inválida");
                        else
                            player iPrintLnBold("Invalid amount");
                    }
                }
                else
                {
                    if (player.valuelang == 0)
                        player iPrintLnBold("Uso: #deposit <cantidad>");
                    else
                        player iPrintLnBold("Usage: #deposit <amount>");
                }
                break;

            case "depositall":
            case "depall":
            case "dall":
                bank_deposit_all(player);
                break;

            case "withdraw":
            case "wd":
            case "w":
                if (isDefined(args[1]))
                {
                    amount = int(args[1]);
                    if (amount > 0)
                    {
                        bank_withdraw(player, amount);
                    }
                    else
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("Cantidad inválida");
                        else
                            player iPrintLnBold("Invalid amount");
                    }
                }
                else
                {
                    if (player.valuelang == 0)
                        player iPrintLnBold("Uso: #withdraw <cantidad>");
                    else
                        player iPrintLnBold("Usage: #withdraw <amount>");
                }
                break;

            case "withdrawall":
            case "wdall":
            case "wall":
                bank_withdraw_all(player);
                break;

            case "balance":
            case "bal":
            case "b":
                balance = get_bank_balance(player);
                if(player.valuelang == 0)
                {
                    player iPrintLnBold("banco balance: " + balance + " puntos");
                }else if(player.valuelang == 1)
                {
                    player iPrintLnBold("Bank Balance: " + balance + " points");
                }
                break;
            case "lang":
            case "lg":
                if (isDefined(args[1]))
                {
                    if(args[1] == "es")
                    {
                        player.valuelang = 0;
                        player iPrintLnBold("Se ha cambiado el idioma a español");
                    }else if(args[1] == "en")
                    {
                        player.valuelang = 1;
                        player iPrintLnBold("The language has been changed to English");
                    }
                }
                break;

            case "pay":
            case "p":
                if (isDefined(args[1]) && isDefined(args[2]))
                {
                    receiver_name = args[1];
                    amount = int(args[2]);
                    if (amount > 0)
                    {
                        bank_pay_player(player, receiver_name, amount);
                    }
                    else
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("Cantidad inválida");
                        else
                            player iPrintLnBold("Invalid amount");
                    }
                }
                else
                {
                    if (player.valuelang == 0)
                        player iPrintLnBold("Uso: #pay <nombre_jugador> <cantidad>");
                    else
                        player iPrintLnBold("Usage: #pay <player_name> <amount>");
                }
                break;

            case "paybank":
            case "pbank":
            case "pb":
                if (isDefined(args[1]) && isDefined(args[2]))
                {
                    target_guid = args[1];
                    amount = int(args[2]);
                    if (amount > 0)
                    {
                        bank_pay_to_guid(player, target_guid, amount);
                    }
                    else
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("Cantidad inválida");
                        else
                            player iPrintLnBold("Invalid amount");
                    }
                }
                else
                {
                    if (player.valuelang == 0)
                        player iPrintLnBold("Uso: #paybank <guid> <cantidad>");
                    else
                        player iPrintLnBold("Usage: #paybank <guid> <amount>");
                }
                break;

            case "guid":
                if (isDefined(args[1]))
                {
                    target_name = args[1];
                    guid = get_player_guid_by_name(target_name);
                    if (isDefined(guid))
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("GUID de ^7" + target_name + "^7: ^2" + guid);
                        else
                            player iPrintLnBold("^7" + target_name + "'s ^7GUID: ^2" + guid);
                    }
                    else
                    {
                        if (player.valuelang == 0)
                            player iPrintLnBold("^1Jugador '" + target_name + "' no encontrado o nunca ha jugado");
                        else
                            player iPrintLnBold("^1Player '" + target_name + "' not found or never played");
                    }
                }
                else
                {
                    if (player.valuelang == 0)
                        player iPrintLnBold("Uso: #guid <nombre_jugador>");
                    else
                        player iPrintLnBold("Usage: #guid <player_name>");
                }
                break;

            }
        }
    }
}