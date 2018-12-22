const mappings = require("./mappings");
const utils = require("./utils");

const Unit = class {
	constructor (itemId1, itemId2, knownItemId, isSpawnedAtStart = false ) {
		this.itemId1 = itemId1;
		this.itemId2 = itemId2;

		this.objectId1 = null;
		this.objectId2 = null;

		this.itemId = knownItemId || null;

		const spawnedAtStartCheck = (itemId1 !== null) && utils.isEqualItemId(itemId1, itemId2);
		this.isSpawnedAtStart = isSpawnedAtStart || spawnedAtStartCheck;

		this.displayName = null;
		this.isBuilding = false;
		this.isUnit = false;
		this.isItem = false;

		// non-selectable things on the map
		// like trees
		
		this.hasBeenInGroup = false;

		this.abilityFlags = null;
		this.spawning = true;

		this.selected = false;

		this.currentX = 0;
		this.currentY = 0;

		this.path = [];
		this.state = null;

		this.trainedUnits = [];

		this.learnedSkills = {};
		this.knownLevel = 0;

		this.setUnitMeta();
	}

	setAliveFlags () {
		this.spawning = false;
	}

	setUnitMeta () {
		const { 
			displayName, 
			isBuilding, 
			isUnit,
			isItem,
			meta
		} = mappings.getUnitInfo(this.itemId);

		this.displayName = displayName;
		this.isBuilding = isBuilding;
		this.isUnit = isUnit;
		this.isItem = isItem;
		
		this.meta = meta;
	}

	registerItemIds (itemId1, itemId2) {
		this.itemId1 = itemId1;
		this.itemId2 = itemId2;

		this.hasBeenInGroup = true;
	}

	registerObjectIds (objectId1, objectId2) {
		this.objectId1 = objectId1;
		this.objectId2 = objectId2;

		this.isSpawnedAtStart = this.objectId1 === this.objectId2;

		this.hasBeenInGroup = true;
	}

	registerUnit (itemId, objectId1, objectId2) {
		this.itemId = itemId;
		this.objectId1 = objectId1;
		this.objectId2 = objectId2;

		this.isSpawnedAtStart = this.objectId1 === this.objectId2;

		this.setUnitMeta();
		this.hasBeenInGroup = true;
	}

	upgradeBuilding (newItemId) {
		this.itemId = newItemId;

		this.setUnitMeta();
		this.hasBeenInGroup = true;
	}

	spawn () {
		this.spawning = false;
	}

	select () {
		this.selected = true;
	}

	deselect () {
		this.selected = false;
	}

	getSkillForType (skillType) {
		let skillKey = Object.keys(this.learnedSkills).find(key => {
			let learnedSkill = this.learnedSkills[key];

			return learnedSkill.type === skillType;
		});

		return skillKey && mappings.heroAbilities[skillKey] || null;
	}

	moveTo (targetX, targetY) {
		this.state = "walking";

		this.path.push({
			x: targetX,
			y: targetY
		});

		this.currentX = targetX;
		this.currentY = targetY;
	}
};

module.exports = Unit;