const { startCoordinate, endCoordinate, blocks } = require('./config');

function locationStatus(location, grid) {
	const gridSize = grid.length;
	const dft = location.distanceFromTop;
	const dfl = location.distanceFromLeft;
	if (location.distanceFromLeft < 0
      || location.distanceFromLeft >= gridSize
      || location.distanceFromTop < 0
      || location.distanceFromTop >= gridSize) {
		return 'Invalid';
	} if (grid[dft][dfl] === 'Goal') {
		return 'Goal';
	} if (grid[dft][dfl] !== 'Empty') {
		return 'Blocked';
	}
	return 'Valid';
}


function exploreInDirection(currentLocation, direction, grid) {
	const newPath = currentLocation.path.slice();

	newPath.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft}`);
	let dft = currentLocation.distanceFromTop;
	let dfl = currentLocation.distanceFromLeft;
	if (direction === 'North') {
		dft -= 1;
	} else if (direction === 'East') {
		dfl += 1;
	} else if (direction === 'South') {
		dft += 1;
	} else if (direction === 'West') {
		dfl -= 1;
	}
	const newLocation = {
		distanceFromTop: dft,
		distanceFromLeft: dfl,
		path: newPath,
		status: 'Unknown',
	};
	newLocation.status = locationStatus(newLocation, grid);

	if (newLocation.status === 'Valid') {
		grid[newLocation.distanceFromTop][newLocation.distanceFromLeft] = 'Visited';
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
				if (row[j] === 'Visited') {
					row[j] = 'Empty';
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
		status: 'Start',
	};

	const queue = [location];

	while (queue.length > 0) {
		const currentLocation = queue.shift();
		// Explore North
		const northLocation = exploreInDirection(currentLocation, 'North', grid);
		if (northLocation.status === 'Goal') {
			const result = northLocation.path;
			result.push(`${currentLocation.distanceFromTop - 1}, ${currentLocation.distanceFromLeft}`);
			reset(grid);
			return result;
		} if (northLocation.status === 'Valid') {
			queue.push(northLocation);
		}
		// Explore East
		const eastLocation = exploreInDirection(currentLocation, 'East', grid);
		if (eastLocation.status === 'Goal') {
			const result = eastLocation.path;
			result.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft + 1}`);
			reset(grid);
			return result;
		} if (eastLocation.status === 'Valid') {
			queue.push(eastLocation);
		}
		// Explore South
		const southLocation = exploreInDirection(currentLocation, 'South', grid);
		if (southLocation.status === 'Goal') {
			const result = southLocation.path;
			result.push(`${currentLocation.distanceFromTop + 1}, ${currentLocation.distanceFromLeft}`);
			reset(grid);
			return result;
		} if (southLocation.status === 'Valid') {
			queue.push(southLocation);
		}
		// Explore West
		const westLocation = exploreInDirection(currentLocation, 'West', grid);
		if (westLocation.status === 'Goal') {
			const result = westLocation.path;
			result.push(`${currentLocation.distanceFromTop}, ${currentLocation.distanceFromLeft - 1}`);
			reset(grid);
			return result;
		} if (westLocation.status === 'Valid') {
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
		matrix.push(new Array(size).fill('Empty'));
	}

	matrix[x1][y1] = 'Start';
	matrix[x2][y2] = 'Goal';

	while (placedBlocks < blocks) {
		console.log('trying to place obstacle');
		const randX = randomNumberBetween(0, 9);
		const randY = randomNumberBetween(0, 9);

		const isStartOrEnd = (randX === x1 && randY === y1) || (randX === x2 && randY === y2);
		const isAlreadyObstacle = matrix[randX][randY] === 'Obstacle';

		if (!(isStartOrEnd || isAlreadyObstacle)) {
			console.log(`Placing on ${randX} - ${randY}`);
			matrix[randX][randY] = 'Obstacle';
		}


		if (!findShortestPath(startCoordinate, matrix)) {
			matrix[randX][randY] = 'Empty';
		}
		placedBlocks += 1;
	}

	return matrix;
}

console.log('running...');
const matrix = generateRandomMatrix(10, startCoordinate, endCoordinate);
const result = findShortestPath(startCoordinate, matrix);
console.log(result);
