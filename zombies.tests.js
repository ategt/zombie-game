const test = require('tape')
const sinon = require('sinon')

const jsdom = require('jsdom')

const { JSDOM } = jsdom

const dom = new JSDOM('<body></body>')

const document = dom.window.document

global.window = dom.window
global.document = document

const zombies = require('./zombies')

zombies.myGameArea.stop()

const beforeEach = require('tape')
const afterEach = require('tape')

beforeEach('this will happen before each test', (assert) => {
	// Setup items go here.

	assert.end();
})

afterEach('this will happen after each test', (assert) => {
	// Teardown items go here.
	zombies.myGameArea.stop()
	sinon.restore()
	restoreSpawnZombie()
	restoreDropSupplyCreate()
	assert.end();
})

advanceGame = function(numberOfFrames) {
	for (let i = 0; i < numberOfFrames ; i++) {
			zombies.updateGameArea()
		}	
}

advanceGameUntilPieceStops = function(gamePiece) {
	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}
}	


const wait = (ms) => new Promise((r, j) => setTimeout(r, ms))

test('The frame counter increments over time', async (assert) => {

	zombies.startGame()

	assert.equal(zombies.myGameArea.frameNo, 0)

	await wait(500)

	assert.ok(zombies.myGameArea.frameNo > 10, zombies.myGameArea.frameNo)

	zombies.myGameArea.stop()

	assert.end()
})


test('Player starts out in screen and moves around', (assert) => {
	zombies.setupGame()

	zombies.updateGameArea()

	let gamePiece = zombies.getMyGamePiece()

	assert.equal(gamePiece.x, 10)
	assert.equal(gamePiece.y, 118)

	advanceGame(10)

	assert.equal(gamePiece.x, 10)
	assert.equal(gamePiece.y, 125.5)

	gamePiece.moveright()

	advanceGame(10)

	assert.ok(gamePiece.x > 10)

	let newX = gamePiece.x

	gamePiece.clearX()

	advanceGame(10)

	assert.equal(gamePiece.x, newX)

	gamePiece.moveleft()

	advanceGame(10)

	assert.equal(gamePiece.x, 10)

	advanceGame(10)

	assert.ok(gamePiece.x < 10)

	assert.ok(gamePiece.x >= 0)

	gamePiece.clearX()
	gamePiece.moveright()

	advanceGame(5)

	gamePiece.clearX()

	newX = gamePiece.x
	let newY = gamePiece.y

	gamePiece.jump()

	advanceGame(1)

	gamePiece.clearY()

	advanceGame(10)

	assert.ok(gamePiece.y < newY)
	assert.equal(newX, gamePiece.x)

	advanceGame(250)

	assert.equal(gamePiece.y, newY)

	assert.end();
})

test('A Tile test', (assert) => {

  let r = [2,2,2]

  let c = r.randomElement()

  assert.equal(c, 2)

  assert.end();
});

const spawnZombie = zombies.getSpawnZombie()
const dropSupplyCreate = zombies.getDropSupplyCreate()

mockupSpawnZombie = function() {
	const spawnFake = sinon.fake()
	zombies.setSpawnZombie(spawnFake)

	return spawnFake
}

restoreSpawnZombie = function() {
	zombies.setSpawnZombie(spawnZombie)
}

mockupDropSupplyCreate = function() {
	const dropSupplyCreateFake = sinon.fake()
	zombies.setSpawnZombie(dropSupplyCreateFake)

	return dropSupplyCreateFake
}

restoreDropSupplyCreate = function() {
	zombies.setDropSupplyCreate(dropSupplyCreate)
}

getRockets = () => zombies.getObjects().filter((item, index) => item.type == 'missle')

test('Shoot over zombie with rocket launcher', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	zombies.updateGameArea()

	const gamePiece = zombies.getMyGamePiece()
	const allZombies = zombies.getAllZombies()
	const activeZombies = zombies.getActiveZombies()

	advanceGame(1)

	spawnZombie(250, -1);

	assert.equal(activeZombies.length, 1)
	assert.ok(allZombies.size > 0)

	const firstZombie = activeZombies[0]
	const zombie_id = firstZombie.id

	let statusText = zombies.getStatusText()

	assert.equal(getRockets().length, 0)

	gamePiece.fireMissle()

	assert.equal(getRockets().length, 1)

	let rocket = getRockets()[0]

	let rocket_x = rocket.x
	let rocket_y = rocket.y

	advanceGame(2)

	assert.equal(getRockets().length, 1)

	rocket = getRockets()[0]

	assert.equal(rocket_y, rocket.y)
	assert.ok(rocket_x < rocket.x)

	rocket_x = rocket.x

	while (getRockets().length == 1) {
		advanceGame(1)
	}

	advanceGame(5)

	assert.equal(getRockets().length, 0)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 1)
	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(allZombies.size > 0)

	statusText = zombies.getStatusText()

	console.log(statusText)

	assert.ok(allZombies.size > 0)

	assert.end()

})

test('Shoot zombie with rocket launcher', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	zombies.updateGameArea()

	const gamePiece = zombies.getMyGamePiece()
	const allZombies = zombies.getAllZombies()
	const activeZombies = zombies.getActiveZombies()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(150, -1);

	assert.equal(activeZombies.length, 1)
	assert.ok(allZombies.size > 0)

	const firstZombie = activeZombies[0]
	const zombie_id = firstZombie.id

	let statusText = zombies.getStatusText()

	assert.equal(getRockets().length, 0)

	gamePiece.fireMissle()

	assert.equal(getRockets().length, 1)

	let rocket = getRockets()[0]

	let rocket_x = rocket.x
	let rocket_y = rocket.y

	advanceGame(2)

	assert.equal(getRockets().length, 1)

	rocket = getRockets()[0]

	assert.equal(rocket_y, rocket.y)
	assert.ok(rocket_x < rocket.x)

	rocket_x = rocket.x

	while (getRockets().length == 1) {
		advanceGame(1)
	}

	advanceGame(5)

	assert.equal(getRockets().length, 0)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 0)
	assert.equal(zombies.getActiveZombies().length, 0)
	assert.ok(allZombies.size > 0)

	statusText = zombies.getStatusText()

	console.log(statusText)

	assert.ok(allZombies.size > 0)

	assert.end()

})

test('Player dies in rocket splash', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	zombies.updateGameArea()

	const gamePiece = zombies.getMyGamePiece()
	const allZombies = zombies.getAllZombies()
	const activeZombies = zombies.getActiveZombies()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(80, -1);

	assert.equal(activeZombies.length, 1)
	assert.ok(allZombies.size > 0)

	const firstZombie = activeZombies[0]
	const zombie_id = firstZombie.id

	let statusText = zombies.getStatusText()

	assert.equal(getRockets().length, 0)

	gamePiece.fireMissle()

	assert.equal(getRockets().length, 1)

	let rocket = getRockets()[0]

	let rocket_x = rocket.x
	let rocket_y = rocket.y

	advanceGame(2)

	assert.equal(getRockets().length, 1)

	rocket = getRockets()[0]

	assert.equal(rocket_y, rocket.y)
	assert.ok(rocket_x < rocket.x)

	rocket_x = rocket.x

	while (getRockets().length == 1) {
		advanceGame(1)
	}

	advanceGame(5)

	assert.equal(getRockets().length, 0)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 0)
	assert.equal(zombies.getActiveZombies().length, 0)
	assert.ok(allZombies.size > 0)

	statusText = zombies.getStatusText()

	console.log(statusText, zombies.isGameRunning())

	assert.ok(allZombies.size > 0)
	assert.ok(!zombies.isGameRunning(), "Game should end when player takes rocket splash.")

	assert.end()

})

test('zombie attacks from left', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	zombies.updateGameArea()

	const gamePiece = zombies.getMyGamePiece()
	const allZombies = zombies.getAllZombies()
	const activeZombies = zombies.getActiveZombies()

	advanceGame(1)

	spawnZombie(-50, -1);

	assert.equal(activeZombies.length, 1)
	assert.ok(allZombies.size > 0)

	const firstZombie = activeZombies[0]
	const zombie_id = firstZombie.id

	while (zombies.isGameRunning() == true) {
		advanceGame(1)
	}

	statusText = zombies.getStatusText()

	console.log(statusText)

	assert.ok(!zombies.isGameRunning(), 'Game should end when zombie bites player.')

	assert.end()
})

test('Laser kills zombie', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(150, -1);

	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 0)
	assert.equal(zombies.getActiveZombies().length, 0)
	assert.ok(zombies.getAllZombies().size > 0)

	assert.end()
})

test('Laser kills many zombies', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(150, -1);
	spawnZombie(140, -1);
	spawnZombie(130, -1);
	spawnZombie(120, -1);
	spawnZombie(110, -1);
	spawnZombie(100, -1);

	assert.equal(zombies.getActiveZombies().length, 6)
	assert.ok(zombies.getAllZombies().size > 5)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().length, 0)
	assert.ok(zombies.getAllZombies().size > 5)

	assert.end()
})

test('Laser shoots backward at zombie', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(-10, -1);

	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.direction = -1

	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 0)
	assert.equal(zombies.getActiveZombies().length, 0)
	assert.ok(zombies.getAllZombies().size > 0)

	assert.end()
})

test('Laser shot backward misses zombie infront of player', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(150, -1);

	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.direction = -1
	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 1)
	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	assert.end()
})

test('Laser shot forward misses zombie behind player', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	while (oldGamePieceY != gamePiece.y) {
		oldGamePieceY = gamePiece.y
		advanceGame(3)
	}

	spawnZombie(-10, -1);

	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.direction = 1
	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 1)
	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	assert.end()
})

test('Laser misses over zombie', (assert) => {
	zombies.setupGame()

	const spawnZombieFake = mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	let oldGamePieceY = gamePiece.y

	advanceGame(1)

	spawnZombie(150, -1);

	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	const firstZombie = zombies.getActiveZombies()[0]
	const zombie_id = firstZombie.id

	gamePiece.shootLaser()

	advanceGame(1)

	assert.equal(zombies.getActiveZombies().filter((zombie, index) => zombie.id == zombie_id).length, 1)
	assert.equal(zombies.getActiveZombies().length, 1)
	assert.ok(zombies.getAllZombies().size > 0)

	assert.end()
})

test('Player trips land mine', (assert) => {
	zombies.setupGame()

	mockupSpawnZombie()
	mockupDropSupplyCreate()

	advanceGame(1)

	const gamePiece = zombies.getMyGamePiece()

	advanceGameUntilPieceStops(gamePiece)

	advanceGame(1)

	gamePiece.dropMine()

	advanceGame(1)

	assert.ok(zombies.isGameRunning(), "Player should  be able to walk away from mine before it detonates.")

	const mines = zombies.getObjects().filter((item, index) => item.type == 'mine' )
	assert.equal(mines.length, 1)

	assert.ok(mines[0].fuse > 1)

	advanceGame(mines[0].fuse + 2)

	assert.ok(!zombies.isGameRunning(), "Player should trip mine and end game.")

	assert.end()
})

test('Supply crate should trip land mine', (assert) => {
	zombies.setupGame()

	mockupSpawnZombie()
	mockupDropSupplyCreate()

	const gamePiece = zombies.getMyGamePiece()

	advanceGameUntilPieceStops(gamePiece)

	const y = gamePiece.y

	const supplyCrate = dropSupplyCreate()

	gamePiece.x = supplyCrate.x

	gamePiece.dropMine()

	gamePiece.x = 0

	advanceGame(1)

	const mines = zombies.getObjects().filter((item, index) => item.type == 'mine' )
	assert.equal(mines.length, 1)

	mines[0].fuse = 1

	advanceGame(1)
	
	assert.ok(mines[0].isExplosive())

	advanceGameUntilPieceStops(supplyCrate)	

	assert.equal(zombies.getObjects().filter((item, index) => item.type == 'mine').length, 0)

	assert.end()
})

test('A mine detonating should trigger the one next to it', (assert) => {
	zombies.setupGame()

	const gamePiece = zombies.getMyGamePiece()

	advanceGameUntilPieceStops(gamePiece)

	gamePiece.x = 5

	gamePiece.dropMine()

	gamePiece.x = 7

	gamePiece.dropMine()

	advanceGame(1)

	const mines = zombies.getObjects().filter((item, index) => item.type == 'mine' )
	assert.equal(mines.length, 2)

	advanceGame( mines[0].fuse + 2)

	assert.ok(mines[0].isExplosive())

	mines[0].detonate()

	assert.equal(zombies.getObjects().filter((item, index) => item.type == 'mine').length, 0)

	assert.end()	
})

test('Several mines detonating should not crash game', (assert) => {
	zombies.setupGame()

	const gamePiece = zombies.getMyGamePiece()

	advanceGameUntilPieceStops(gamePiece)

	gamePiece.x = 5

	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()
	gamePiece.dropMine()

	for (let i = 6; i < 250; i++) {
		gamePiece.x = i
		gamePiece.dropMine()
	}

	advanceGame(1)

	const mines = zombies.getObjects().filter((item, index) => item.type == 'mine' )
	assert.ok(mines.length > 2)

	advanceGame( mines[0].fuse + 2)

	assert.ok(mines[0].isExplosive())

	mines[0].detonate()

	advanceGame(5)

	assert.equal(zombies.getObjects().filter((item, index) => item.type == 'mine').length, 0)

	assert.end()	
})