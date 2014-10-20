var path = require('path')
var fs = require('fs')

var currDir = ''
// currDir = path.resolve('.')
// currDir = process.cwd()

module.exports = {
    "Class"                             : currDir + '/../../src/base/Base.Class.js',
    "EventEmitter"                      : currDir + '/../../src/base/Base.Eventemitter.js',
    "Namespace"                         : currDir + '/../../src/base/Base.Namespace.js',

    "System"                            : currDir + '/../../src/classlib/System.js',
    "System.Array"                      : currDir + '/../../src/classlib/System.Array.js',
    "System.Boolean"                    : currDir + '/../../src/classlib/System.Boolean.js',
    "System.Date"                       : currDir + '/../../src/classlib/System.Date.js',
    "System.Error"                      : currDir + '/../../src/classlib/System.Error.js',
    "System.Function"                   : currDir + '/../../src/classlib/System.Function.js',
    "System.Input"                      : currDir + '/../../src/classlib/System.Input.js',
    "System.Math"                       : currDir + '/../../src/classlib/System.Math.js',
    "System.Number"                     : currDir + '/../../src/classlib/System.Number.js',
    "System.Resources"                  : currDir + '/../../src/classlib/System.Resources.js',
    "System.Resources.Strings"          : currDir + '/../../src/classlib/System.Resources.Strings.js',
    "System.Resources.Integers"         : currDir + '/../../src/classlib/System.Resources.Integers.js',
    "System.String"                     : currDir + '/../../src/classlib/System.String.js',
    "System.Utility"                    : currDir + '/../../src/classlib/System.Utility.js',
    "System.Threading.SometimeWhen"     : currDir + '/../../src/classlib/System.Threading.SometimeWhen.js',
    "System.Threading.Whenever"         : currDir + '/../../src/classlib/System.Threading.Whenever.js',
    "System.Threading.YieldingEach"     : currDir + '/../../src/classlib/System.Threading.YieldingEach.js',
    "System.Collections.LinkedList"     : currDir + '/../../src/classlib/System.Collections.LinkedList.js',
    "System.Collections.LinkedListItem" : currDir + '/../../src/classlib/System.Collections.LinkedListItem.js',
    "Web.CookieManager"                 : currDir + '/../../src/classlib/Web.CookieManager.js',

    "Geo.Locations"                     : currDir + '/../../src/geo/Geo.Locations.js',
    "Geo.World"                         : currDir + '/../../src/geo/Geo.World.js',

    "Game.Dice"                         : currDir + '/../../src/game/Game.Dice.js',

    "RPG"                               : currDir + '/../../src/rpg/RPG.js',
    "RPG.Body"                          : currDir + '/../../src/rpg/RPG.Body.js',
    "RPG.Armor"                         : currDir + '/../../src/rpg/RPG.Armor.js',
    "RPG.Character"                     : currDir + '/../../src/rpg/RPG.Character.js',
    "RPG.Damage"                        : currDir + '/../../src/rpg/RPG.Damage.js',
    "RPG.Humanoid"                      : currDir + '/../../src/rpg/RPG.Humanoid.js',
    "RPG.Races.Dwarf"                   : currDir + '/../../src/rpg/RPG.Races.Dwarf.js',
    "RPG.Races.Elf"                     : currDir + '/../../src/rpg/RPG.Races.Elf.js',
    "RPG.Races.Gnome"                   : currDir + '/../../src/rpg/RPG.Races.Gnome.js',
    "RPG.Races.Human"                   : currDir + '/../../src/rpg/RPG.Races.Human.js',
    "RPG.Races.Orc"                     : currDir + '/../../src/rpg/RPG.Races.Orc.js',
    "RPG.Weapon"                        : currDir + '/../../src/rpg/RPG.Weapon.js',
    "RPG.Weapons"                       : currDir + '/../../src/rpg/RPG.Weapons.js',
    "RPG.Weapons.Arrow"                 : currDir + '/../../src/rpg/RPG.Weapons.Arrow.js',
    "RPG.Weapons.Axe"                   : currDir + '/../../src/rpg/RPG.Weapons.Axe.js',
    "RPG.Weapons.Bow"                   : currDir + '/../../src/rpg/RPG.Weapons.Bow.js',
    "RPG.Weapons.Club"                  : currDir + '/../../src/rpg/RPG.Weapons.Club.js',
    "RPG.Weapons.Hammer"                : currDir + '/../../src/rpg/RPG.Weapons.Hammer.js',
    "RPG.Weapons.Spear"                 : currDir + '/../../src/rpg/RPG.Weapons.Spear.js',
    "RPG.Weapons.Sword"                 : currDir + '/../../src/rpg/RPG.Weapons.Sword.js'
    }