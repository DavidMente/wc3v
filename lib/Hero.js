const utils = require("../helpers/utils"),
      mappings = require("../helpers/mappings");

const Unit = require("./Unit");

const { 
	abilityActions,
	abilityFlagNames,
	mapStartPositions,
	specialBuildings,
	itemAbilityData
} = mappings;

const Hero = class extends Unit {
	constructor (eventTimer, itemId1, itemId2, knownItemId, isSpawnedAtStart = false) {
		super(eventTimer, itemId1, itemId2, knownItemId, isSpawnedAtStart);

		this.isIllusion = false;
	}

	static doAbilityRightClickWithTargetAndObjectId (
		player,
		focusUnit,
		objectId1,
		objectId2,
		targetX,
		targetY
	) {

		if (objectId1 === -1 && objectId2 === -1) {
			// TODO: rally point and ability on ground here
			console.log("player or building used ability on ground");

			return;
		}
		
		console.log(player.id, "hero clicked on an object.");
		let droppedItem = player.world.findDroppedItem(objectId1, objectId2);

		if (droppedItem) {
			console.log(player.id, "Found a dropped item in the world: ", droppedItem.displayName);

			focusUnit.tradeItem(droppedItem);
			player.world.removeDroppedItem(objectId1, objectId2);
		} else {
			// add unknown object to world track list
			console.log(player.id, "Added unknown object to world.");
			player.world.addUnknownObject(objectId1, objectId2);
		}
	}

	static doAbilityNoTargetItemArray (
		player,
		focusUnit,
		itemId,
		abilityFlags,
		unknownA,
		unknownB
	) {
		const abilityActionName = utils.findItemIdForObject(itemId, abilityActions);

		switch (abilityActionName) {
			case 'CastSummonSkill':
			case 'CastSummonSkillNoTarget':
				console.log("Unit called summon skill: ", focusUnit.displayName);

				let skill = focusUnit.getSkillForType("summon");
				console.log("Skill: ", skill);

				if (!skill) {
					console.error("Cound not find skill.", focusUnit);
					return;
				}

				const {summonCount, summonItemId } = skill;
				for (let i = 0; i < summonCount; i++) {
					console.log("Making unit: ", i, summonItemId);

					let summonUnit = new Unit(player.eventTimer, null, null, summonItemId, false);
					
					player.addPlayerUnit(summonUnit);
					player.unregisteredUnitCount++;
				}
			break;

			case 'HeroItem1':
			case 'HeroItem2':
			case 'HeroItem3':
			case 'HeroItem4':
			case 'HeroItem5':
			case 'HeroItem6':
				let itemSlot = abilityActionName.substring(abilityActionName.length - 1);

				console.log(player.id, "Used item slot: ", itemSlot);
				let heroItem = focusUnit.items[itemSlot];

				if (!heroItem) {
					console.log("Used item but hero had null item slot.", focusUnit);

					const heroItems = focusUnit.getItemList();
					console.log("Possible items: ", heroItems.map(item => { return item.item.displayName; }));

					return;
				}
					
				console.log(player.id, "Item used: ", heroItem.displayName);
				
				const itemData = itemAbilityData[heroItem.itemId];

				if (itemData) {
					console.log("found item data: ", itemData);

					switch (itemData.type) {
						case "summon":
							const { summonCount, summonItemId, summonDuration } = itemData;
							
							for (let i = 0; i < summonCount; i++) {
								let newUnit = new Unit(player.eventTimer, null, null, summonItemId, false, summonDuration);
								
								console.log("summoning unit: ", newUnit.displayName);
								player.addPlayerUnit(newUnit);
							}
						break;
					}
				}

			break;

			default:
				console.log("Unknown hero ability with no target.");
				console.log("Hero: ", focusUnit.displayName);
				console.log("Item ID: ", itemId);
				console.log("Ability flags: ", abilityFlags);
				console.log("***************************");
			break;
		};
	}


	static doAbilityNoTargetItemId (
		player,
		focusUnit,
		itemId,
		abilityFlags,
		unknownA,
		unknownB
	) {
		const unitInfo = mappings.getUnitInfo(itemId);

		switch (abilityFlags) {
			// learn skill
			case abilityFlagNames.LearnSkillOrTrain:
				let spell = mappings.heroAbilities[itemId];
				if (!spell) {
					console.log(`Unable to find spell for: ${itemId}`);
					return;
				}

				if (!focusUnit.learnedSkills[itemId]) {
					// learning first level
					spell.level = 1;

					focusUnit.learnedSkills[itemId] = spell;
					console.log("%% Learned spell: ", spell);
				} else {
					focusUnit.learnedSkills[itemId].level++;
					console.log("Leveled up skill: ", focusUnit.learnedSkills[itemId]);
				}

				focusUnit.knownLevel++;

				console.log(player.id, "Hero leveled up: ", focusUnit.displayName, focusUnit.knownLevel);
			break;

			default:
				console.log("No match for hero ability flag");
				console.log("Hero name: ", focusUnit.displayName);
				console.log("Unit info for itemId: ", unitInfo);
			break;	
		}

	}
};

module.exports = Hero;