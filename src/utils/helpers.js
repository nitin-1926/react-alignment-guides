export const calculateGuidePositions = (dimensions, axis) => {
	if (axis === 'x') {
		const start = dimensions.left;
		const middle = dimensions.left + parseInt(dimensions.width / 2, 10);
		const end = dimensions.left + dimensions.width;

		return [ start, middle, end ];
	} else {
		const start = dimensions.top;
		const middle = dimensions.top + parseInt(dimensions.height / 2, 10);
		const end = dimensions.top + dimensions.height;

		return [ start, middle, end ];
	}
};

export const proximityListener = (active, allGuides) => {
	const xAxisGuidesForActiveBox = allGuides[active].x;
	const yAxisGuidesForActiveBox = allGuides[active].y;

	const xAxisAllGuides = getAllGuidesForGivenAxisExceptActiveBox(allGuides, xAxisGuidesForActiveBox, 'x');
	const yAxisAllGuides = getAllGuidesForGivenAxisExceptActiveBox(allGuides, yAxisGuidesForActiveBox, 'y');
	const xAxisMatchedGuides = checkValueProximities(xAxisGuidesForActiveBox, xAxisAllGuides);
	const yAxisMatchedGuides = checkValueProximities(yAxisGuidesForActiveBox, yAxisAllGuides);

	const allMatchedGuides = {};

	if (xAxisMatchedGuides.proximity) {
		allMatchedGuides.x = {
			...xAxisMatchedGuides,
			activeBoxGuides: xAxisGuidesForActiveBox
		};
	}

	if (yAxisMatchedGuides.proximity) {
		allMatchedGuides.y = {
			...yAxisMatchedGuides,
			activeBoxGuides: yAxisGuidesForActiveBox,
		};
	}

	return allMatchedGuides;
};

export const getAllGuidesForGivenAxisExceptActiveBox = (allGuides, guidesForActiveBoxAlongGivenAxis, axis) => {
	const result = Object.keys(allGuides).map(box => {
		if (allGuides && allGuides[box]) {
			const currentBoxGuidesAlongGivenAxis = allGuides[box][axis];
			if (currentBoxGuidesAlongGivenAxis !== guidesForActiveBoxAlongGivenAxis) {
				return currentBoxGuidesAlongGivenAxis;
			}
		}
	});

	return result.filter(guides => guides !== undefined);
};

export const checkValueProximities = (activeBoxGuidesInOneAxis, allOtherGuidesInOneAxis) => {
	let proximity = null;
	let intersection = null;
	let matchedArray = [];
	const snapThreshold = 5;
	for (let index = 0; index < allOtherGuidesInOneAxis.length; index += 1) {
		let index2 = 0;
		let index3 = 0;

		while (index2 < activeBoxGuidesInOneAxis.length && index3 < allOtherGuidesInOneAxis[index].length) {
			const diff = Math.abs(activeBoxGuidesInOneAxis[index2] - allOtherGuidesInOneAxis[index][index3]);
			if (diff <= snapThreshold) {
				proximity = { value: diff, activeBoxIndex: index2, matchedBoxIndex: index3 };
				matchedArray = allOtherGuidesInOneAxis[index];
				intersection = allOtherGuidesInOneAxis[index][index3];
			}

			if (activeBoxGuidesInOneAxis[index2] < allOtherGuidesInOneAxis[index][index3]) {
				index2 += 1;
			} else {
				index3 += 1;
			}
		}
	}

	return { matchedArray, proximity, intersection };
};

export const calculateBoundariesForDrag = (left, top, width, height, bounds) => {
	const boundingBox = { ...bounds };
	if (left >= 0 && left <= boundingBox.width - width && top >= 0 && top <= boundingBox.height - height) {
		return {
			left,
			top
		};
	} else if (left >= 0 && left <= boundingBox.width - width) {
		return {
			left,
			top: top < 0 ? 0 : (boundingBox.height - height)
		};
	} else if (top >= 0 && top <= boundingBox.height - height) {
		return {
			left: left < 0 ? 0 : (boundingBox.width - width),
			top
		};
	} else {
		return {
			left: left < 0 ? 0 : (boundingBox.width - width),
			top: top < 0 ? 0 : (boundingBox.height - height)
		};
	}
};

// Calculate boundaries for boxes given an output resolution
export const calculateBoundariesForResize = (left, top, width, height, bounds) => {
	const boundingBox = { ...bounds };
	let widthDifference = 0;
	let heightDifference = 0;
	if (left >= 0 && left + width <= boundingBox.width && top >= 0 && top + height <= boundingBox.height) {
		return {
			left,
			top,
			width,
			height
		};
	} else if (left < 0 && top < 0) {
		return {
			left: 0,
			top: 0,
			width: width + left <= boundingBox.width ? width + left : boundingBox.width,
			height: height + top <= boundingBox.height ? height + top : boundingBox.height
		};
	} else if (left < 0) {
		return {
			left: 0,
			top,
			width: width + left <= boundingBox.width ? width + left : boundingBox.width,
			height: height + top <= boundingBox.height ? height : boundingBox.height - top
		};
	} else if (top < 0) {
		return {
			left,
			top: 0,
			width: width + left <= boundingBox.width ? width : boundingBox.width - left,
			height: height + top <= boundingBox.height ? height + top : boundingBox.height
		};
	} else if (left >= 0 && left + width <= boundingBox.width) {
		heightDifference = (top + height) - boundingBox.height;
		return {
			left,
			top: top < 0 ? 0 : top,
			width,
			height: height - heightDifference
		};
	} else if (top >= 0 && top + height <= boundingBox.height) {
		widthDifference = (left + width) - boundingBox.width;
		return {
			left: left < 0 ? 0 : left,
			top,
			width: width - widthDifference,
			height
		};
	} else {
		widthDifference = (left + width) - boundingBox.width;
		heightDifference = (top + height) - boundingBox.height;
		return {
			left: left < 0 ? 0 : left,
			top: top < 0 ? 0 : top,
			width: width - widthDifference,
			height: height - heightDifference
		};
	}
};

export const getOffsetCoordinates = (node) => {
	return {
		x: node.offsetLeft,
		y: node.offsetTop,
		top: node.offsetTop,
		left: node.offsetLeft,
		width: node.offsetWidth,
		height: node.offsetHeight
	};
};

export const getLength = (x, y) => Math.sqrt(x * x + y * y);

export const topLeftToCenter = ({ left, top, width, height, rotateAngle }) => ({
	cx: left + width / 2,
	cy: top + height / 2,
	width,
	height,
	rotateAngle
});

export const centerToTopLeft = ({ cx, cy, width, height, rotateAngle }) => ({
	top: cy - height / 2,
	left: cx - width / 2,
	width,
	height,
	rotateAngle
});

const setWidthAndDeltaW = (width, deltaW, minWidth) => {
	const expectedWidth = width + deltaW
	if (expectedWidth > minWidth) {
		width = expectedWidth
	} else {
		deltaW = minWidth - width
		width = minWidth
	}
	return { width, deltaW }
}

const setHeightAndDeltaH = (height, deltaH, minHeight) => {
	const expectedHeight = height + deltaH
	if (expectedHeight > minHeight) {
		height = expectedHeight
	} else {
		deltaH = minHeight - height
		height = minHeight
	}
	return { height, deltaH }
}

export const getNewStyle = (type, rect, deltaW, deltaH, minWidth, minHeight) => {
	let { width, height, cx, cy, rotateAngle } = rect;
	const widthFlag = width < 0 ? -1 : 1;
	const heightFlag = height < 0 ? -1 : 1;
	width = Math.abs(width)
	height = Math.abs(height)
	switch (type) {
		case 'tr': {
			deltaH = -deltaH
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx += deltaW / 2 * cos(rotateAngle) + deltaH / 2 * sin(rotateAngle)
			cy += deltaW / 2 * sin(rotateAngle) - deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'br': {
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx += deltaW / 2 * cos(rotateAngle) - deltaH / 2 * sin(rotateAngle)
			cy += deltaW / 2 * sin(rotateAngle) + deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'bl': {
			deltaW = -deltaW
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx -= deltaW / 2 * cos(rotateAngle) + deltaH / 2 * sin(rotateAngle)
			cy -= deltaW / 2 * sin(rotateAngle) - deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'tl': {
			deltaW = -deltaW
			deltaH = -deltaH
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx -= deltaW / 2 * cos(rotateAngle) - deltaH / 2 * sin(rotateAngle)
			cy -= deltaW / 2 * sin(rotateAngle) + deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'ct': {
			deltaW = 0;
			deltaH = -deltaH;
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx -= - deltaH / 2 * sin(rotateAngle)
			cy -= + deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'cb': {
			deltaW = 0;
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx -= deltaH / 2 * sin(rotateAngle)
			cy -= - deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'cl': {
			deltaH = 0;
			deltaW = -deltaW;
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx -= deltaW / 2 * cos(rotateAngle) - deltaH / 2 * sin(rotateAngle)
			cy -= deltaW / 2 * sin(rotateAngle) + deltaH / 2 * cos(rotateAngle)
			break
		}
		case 'cr': {
			deltaH = 0;
			const widthAndDeltaW = setWidthAndDeltaW(width, deltaW, minWidth)
			width = widthAndDeltaW.width
			deltaW = widthAndDeltaW.deltaW
			const heightAndDeltaH = setHeightAndDeltaH(height, deltaH, minHeight)
			height = heightAndDeltaH.height
			deltaH = heightAndDeltaH.deltaH
			cx += deltaW / 2 * cos(rotateAngle)
			cy += deltaW / 2 * sin(rotateAngle)
			break
		}
	}

	return {
		position: {
			cx,
			cy
		},
		size: {
			width: width * widthFlag,
			height: height * heightFlag
		}
	}
}

// Rotate helpers
export const getAngle = ({ x: x1, y: y1 }, { x: x2, y: y2 }) => {
	const dot = x1 * x2 + y1 * y2;
	const det = x1 * y2 - y1 * x2;
	const angle = Math.atan2(det, dot) / Math.PI * 180;
	return (angle + 360) % 360;
};

export const getNewCoordinates = (rect) => {
	const { x, y, width, height, rotateAngle, node } = rect;
	const cx = x + (width / 2);
	const cy = y + (height / 2);

	const tempX = x - cx;
	const tempY = y - cy;
	const cosine = cos(rotateAngle);
	const sine = sin(rotateAngle);

	const rotatedX = cx + (tempX * cosine - tempY * sine);
	const rotatedY = cy + (tempX * sine + tempY * cosine);

	return { x: rotatedX, y: rotatedY, top: rotatedX, left: rotatedY, width, height, rotateAngle, node };
};

export const degToRadian = (deg) => deg * Math.PI / 180;
const cos = (deg) => Math.cos(degToRadian(deg));
const sin = (deg) => Math.sin(degToRadian(deg));

// Multiple selection helpers
export const getMultipleSelectionCoordinates = (allBoxes, activeBoxes) => {
	let selectedBoxes = [];
	for (let box in allBoxes) {
		if (allBoxes.hasOwnProperty(box) && activeBoxes.includes(box)) {
			selectedBoxes.push(allBoxes[box]);
		}
	}
	if (selectedBoxes.length === 0) {
		return {
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			width: 0,
			height: 0
		};
	}


	const x = selectedBoxes.reduce((min, b) => b.x < min ? b.x : min, selectedBoxes[0].x);
	const y = selectedBoxes.reduce((min, b) => b.y < min ? b.y : min, selectedBoxes[0].y);
	const width = selectedBoxes.reduce((max, b) => b.x + b.width > max ? b.x + b.width : max, (selectedBoxes[0].x + selectedBoxes[0].width)) - x;
	const height = selectedBoxes.reduce((max, b) => b.y + b.height > max ? b.y + b.height : max, (selectedBoxes[0].y + selectedBoxes[0].height)) - y;

	return { x, y, top: y, left: x, width, height };
};

export const getGroupCoordinates = (allBoxes, groupedBoxes) => {
	let selectedBoxes = [];
	for (let box in allBoxes) {
		if (allBoxes.hasOwnProperty(box) && groupedBoxes.includes(allBoxes?.[box]?.metadata?.captionIndex)) {
			selectedBoxes.push(allBoxes[box]);
		}
	}
	if (selectedBoxes.length === 0) {
		return {
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			width: 0,
			height: 0
		};
	}
	const x = selectedBoxes.reduce((min, b) => b.x < min ? b.x : min, selectedBoxes[0].x);
	const y = selectedBoxes.reduce((min, b) => b.y < min ? b.y : min, selectedBoxes[0].y);
	const width = selectedBoxes.reduce((max, b) => b.x + b.width > max ? b.x + b.width : max, (selectedBoxes[0].x + selectedBoxes[0].width)) - x;
	const height = selectedBoxes.reduce((max, b) => b.y + b.height > max ? b.y + b.height : max, (selectedBoxes[0].y + selectedBoxes[0].height)) - y;

	return { x, y, top: y, left: x, width, height };
};
export const getBoxMetadata = () => {};

const getResizeSVGCursor = (angle) => {
	return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" viewBox="0 0 32 32" ><path d="M 16,5 L 12,10 L 14.5,10 L 14.5,22 L 12,22 L 16,27 L 20,22 L 17.5,22 L 17.5,10 L 20, 10 L 16,5 Z" stroke-linejoin="round" stroke-width="1.2" fill="black" stroke="white" style="transform:rotate(${angle}deg);transform-origin: 16px 16px"></path></svg>`;
}

export const getResizeCursorCSS = (handle, degree = 0) => {
	let angle = degree;

	if (handle === 'cr' || handle === 'cl') {
		angle += 90;
	} else if (handle === 'tr' || handle === 'bl') {
		angle += 45;
	} else if (handle === 'br' || handle === 'tl') {
		angle -= 45;
	}

	const cursor = getResizeSVGCursor(angle);

	return `url('${cursor}') 16 16, auto`;
}
export const checkGroupChildElementsLocked = (captions) => {
	let isLocked = true;
	captions?.forEach(caption => {
		if (!caption.isLayerLocked) {
			isLocked = false;
			return isLocked;
		}
	});
	return isLocked;
}