const { startCoordinate, endCoordinate, blocks } = require('./config');


const LOCATION_STATUS = {
	INVALID: 'invalid',
	GOAL: 'goal',
	BLOCKED: 'blocked',
	VALID: 'valid',
	EMPTY: 'empty',
	VISITED: 'visited',
	START: 'start',
	OBSTACLE: 'obstacle',
	NORTH: 'north',
	SOUTH: 'south',
	EAST: 'east',
	WEST: 'west',
};

function locationStatus(location, grid) {
	const gridSize = grid.length;
	const dft = location.distanceFromTop;
	const dfl = location.distanceFromLeft;
	if (location.distanceFromLeft < 0
      || location.distanceFromLeft >= gridSize
      || location.distanceFromTop < 0
      || location.distanceFromTop >= gridSize) {
		return LOCATION_STATUS.INVALID;
	} if (grid[dft][dfl] === LOCATION_STATUS.GOAL) {
		return LOCATION_STATUS.GOAL;
	} if (grid[dft][dfl] !== LOCATION_STATUS.EMPTY) {
		return LOCATION_STATUS.BLOCKED;
	}
	return LOCATION_STATUS.VALID;
}


function exploreInDirection(currentLocation, direction, grid) {
	const newPath = currentLocation.path.slice();

	newPath.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft}`);
	let dft = currentLocation.distanceFromTop;
	let dfl = currentLocation.distanceFromLeft;
	if (direction === LOCATION_STATUS.NORTH) {
		dft -= 1;
	} else if (direction === LOCATION_STATUS.EAST) {
		dfl += 1;
	} else if (direction === LOCATION_STATUS.SOUTH) {
		dft += 1;
	} else if (direction === LOCATION_STATUS.WEST) {
		dfl -= 1;
	}
	const newLocation = {
		distanceFromTop: dft,
		distanceFromLeft: dfl,
		path: newPath,
		status: 'Unknown',
	};
	newLocation.status = locationStatus(newLocation, grid);

	if (newLocation.status === LOCATION_STATUS.VALID) {
		grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = LOCATION_STATUS.VISITED;
	}
	return newLocation;
}

function randomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function findShortestPath(startCoordinates, grid) {
	function reset() {
		for (let i = 0; i < grid.length; i += 1) {
			const row = grid[i];
			for (let j = 0; j < row.length; j += 1) {
				if (row[j] === LOCATION_STATUS.VISITED) {
					row[j] = LOCATION_STATUS.EMPTY;
				}
			}
		}
	}

	const distanceFromTop = startCoordinates[0];
	const distanceFromLeft = startCoordinates[1];

	const location = {
		distanceFromTop,
		distanceFromLeft,
		path: [],
		status: LOCATION_STATUS.START,
	};

	const queue = [location];

	while (queue.length > 0) {
		const currentLocation = queue.shift();
		// Explore North
		const northLocation = exploreInDirection(currentLocation, LOCATION_STATUS.NORTH, grid);
		if (northLocation.status === LOCATION_STATUS.GOAL) {
			const result = northLocation.path;
			result.push(`${currentLocation.distanceFromTop - 1}, ${currentLocation.distanceFromLeft}`);
			reset(grid);
			return result;
		} if (northLocation.status === LOCATION_STATUS.VALID) {
			queue.push(northLocation);
		}
		// Explore East
		const eastLocation = exploreInDirection(currentLocation, LOCATION_STATUS.EAST, grid);
		if (eastLocation.status === LOCATION_STATUS.GOAL) {
			const result = eastLocation.path;
			result.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft + 1}`);
			reset(grid);
			return result;
		} if (eastLocation.status === LOCATION_STATUS.VALID) {
			queue.push(eastLocation);
		}
		// Explore South
		const southLocation = exploreInDirection(currentLocation, LOCATION_STATUS.SOUTH, grid);
		if (southLocation.status === LOCATION_STATUS.GOAL) {
			const result = southLocation.path;
			result.push(`${currentLocation.distanceFromTop + 1}, ${currentLocation.distanceFromLeft}`);
			reset(grid);
			return result;
		} if (southLocation.status === LOCATION_STATUS.VALID) {
			queue.push(southLocation);
		}
		// Explore West
		const westLocation = exploreInDirection(currentLocation, LOCATION_STATUS.WEST, grid);
		if (westLocation.status === LOCATION_STATUS.GOAL) {
			const result = westLocation.path;
			result.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft - 1}`);
			reset(grid);
			return result;
		} if (westLocation.status === LOCATION_STATUS.VALID) {
			queue.push(westLocation);
		}
	}

	reset(grid);
	// No valid path found
	return false;
}

function generateRandomMatrix(size, start, end) {
	const [x1, y1] = start;
	const [x2, y2] = end;
	let placedBlocks = 0;
	const matrix = [];
	for (let i = 0; i < size; i += 1) {
		matrix.push(new Array(size).fill(LOCATION_STATUS.EMPTY));
	}

	matrix[x1][y1] = LOCATION_STATUS.START;
	matrix[x2][y2] = LOCATION_STATUS.GOAL;

	while (placedBlocks < blocks) {
		console.log('trying to place obstacle');
		const randX = randomNumberBetween(0, 9);
		const randY = randomNumberBetween(0, 9);

		const isStartOrEnd = (randX === x1 && randY === y1) || (randX === x2 && randY === y2);
		const isAlreadyObstacle = matrix[randX][randY] === LOCATION_STATUS.OBSTACLE;

		if (!(isStartOrEnd || isAlreadyObstacle)) {
			console.log(`Placing on ${randX} - ${randY}`);
			matrix[randX][randY] = LOCATION_STATUS.OBSTACLE;
		}


		if (!findShortestPath(startCoordinate, matrix)) {
			matrix[randX][randY] = LOCATION_STATUS.EMPTY;
		}
		placedBlocks += 1;
	}

	return matrix;
}

console.log('running...');
const matrix = generateRandomMatrix(10, startCoordinate, endCoordinate);
const result = findShortestPath(startCoordinate, matrix);
console.log(result);
