var isCompassEnabled = true
var northAngle = 0
const compassContainer = document.querySelector(".compass-container")
const compass = document.querySelector(".compass-directions")
const compassText = document.querySelector(".compass-directions__text")
const compassAngleInput = document.querySelector("#compassAngle")
const compassOpacityInput = document.querySelector("#compassOpacity")
const compassEnabledInput = document.querySelector("#compassEnabled")
const compassSizeInput = document.querySelector("#compassSize")
const compassImageInput = document.querySelector("#compassImage")
const compassDirections = document.querySelectorAll(".compass-direction")
const compassBoundsInput = document.querySelector("#compassBounds")
const compassResetPositions = document.querySelector("#compassResetPositions")

const sidebarItems = document.querySelector(".sidebar-items")
const layers = document.querySelector(".layers")
const layersWithCompass = []



const addImageBtn = document.querySelector(".sidebar-item__button")
const addImageInput = document.querySelector("#input-image")

const handleAddImageClick = (event) => {
	addImageInput.click()
	addImageInput.addEventListener("change", handleAddImageSelect)
}

const handleAddImageSelect = (event) => {
	const image = event.target.files[0]
	const reader = new FileReader()
	reader.addEventListener("load", showSelectedImage)
	reader.readAsDataURL(image)
	event.target.value = ""	// Allows reading same file multiple times
}

const showSelectedImage = (event) => {
	const imageURL = event.target.result
	addSidebarItem(imageURL)
	addLayer(imageURL)
}

const addSidebarItem = (imageURL) => {
	const newSidebarItem = document.createElement("li")
	newSidebarItem.className = `sidebar-item sidebar-item_${sidebarItems.children.length - 1} selected`
	newSidebarItem.style.backgroundImage = `url(${imageURL})`
	newSidebarItem.innerHTML = `
	<button class="sidebar-item__button sidebar-item__button-delete" aria-label="Delete image" title="Delete image">
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M23 20.168l-8.185-8.187 8.185-8.174-2.832-2.807-8.182 8.179-8.176-8.179-2.81 2.81 8.186 8.196-8.186 8.184 2.81 2.81 8.203-8.192 8.18 8.192z"/></svg>
	</button>
	<div class="sidebar-item__toggle"></div>
	<div class="actions-dropdown">
		<h3 class="sr-only">Actions</h3>
		<ul class="actions-dropdown__items">
			<li class="actions-dropdown__item">
				<label class="actions-dropdown__item-label" for="opacity-slider">Opacity:</label>
				<input class="actions-dropdown__item-range" type="range" min="0" max="100" value="100" id="opacity-slider">
			</li>
			<li class="actions-dropdown__item">
				<button class="actions-dropdown__item-button">Add compass</button>
			</li>
		</ul>
	</div>
	`
	newSidebarItem.children[0].addEventListener("click", event => handleDeleteImageClick(event, newSidebarItem))
	newSidebarItem.querySelector(".actions-dropdown__item-range").addEventListener("input", event => handleImageOpacityChange(event, newSidebarItem))
	const addCompassButton = newSidebarItem.querySelector(".actions-dropdown__item-button")
	addCompassButton.addEventListener("click", event => handleAddCompassClick(event, newSidebarItem))
	addCompassButton.disabled = !isCompassEnabled	// Disable "Add Compass" button if not on mobile

	// Maintain Add-Image button as last item
	const sidebarItemButton = sidebarItems.children[sidebarItems.children.length - 1]
	sidebarItems.replaceChild(newSidebarItem, sidebarItemButton)
	sidebarItems.append(sidebarItemButton)
}

const handleAddCompassClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	layersWithCompass.push(sidebarItemInd)
	rotateLayersWithCompass(northAngle)
}

const handleImageOpacityChange = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	const opacityValue = parseInt(event.target.value)/100
	layers.children[sidebarItemInd].style.opacity = opacityValue
}

const handleDeleteImageClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	sidebarItems.removeChild(sidebarItem)
	layers.removeChild(layers.children[sidebarItemInd])
}

/**
 * Add new layer on top of previous layers
 * @param {string} imageURL 
 */
const addLayer = (imageURL) => {
	const layersCount = layers.children.length - 1
	const newLayer = document.createElement("div")
	const newLayerInd = layersCount + 1
	newLayer.className = `layer layer_${newLayerInd} draggable`
	newLayer.style.zIndex = newLayerInd
	newLayer.innerHTML = "<div class='layer-container'></div>"
	newLayer.children[0].style.backgroundImage = `url(${imageURL})`
	layers.append(newLayer)
}

const getSidebarItemInd = (sidebarItem) => {
	const sidebarItemInd = parseInt((sidebarItem.classList[1].split("_"))[1])
	return sidebarItemInd
}

/**
 * Watch for device movement
 * Update layers(with added compass) when device rotates
 */
const handleDeviceOrientation = (event) => {
	if(isCompassEnabled){
		const heading = Math.abs(event.alpha - 360)
		compassText.textContent = heading.toFixed(1)
		compassAngleInput.value = heading.toFixed(1)
		northAngle = heading * -1
		rotateLayersWithCompass(northAngle)
	}
}

/**
 * Rotate all layers(with added compass)
 * By {angle} degrees
 * @param {double} angle 
 */
const rotateLayersWithCompass = (angle) => {
	for(const layerInd of layersWithCompass){
		layers.children[layerInd].children[0].style.transform = `rotate(${angle}deg)`
	}
	compass.style.transform = `rotate(${angle}deg)`
}

const handleCompassEnabledChange = (event) => {
	const isChecked = event.target.checked
	isCompassEnabled = isChecked
	if(isChecked){
		compassAngleInput.setAttribute("readonly", true)
	}
	else{
		compassAngleInput.removeAttribute("readonly")
	}
}

const handleCompassAngleInputChange = (event) => {
	const angle = event.target.value
	compassText.textContent = angle
	rotateLayersWithCompass(angle)
}

const handleCompassOpacityInputChange = (event) => {
	compass.style.opacity = event.target.value / 100
}

const handleCompassSizeInputChange = (event) => {
	compassContainer.style.transform = `scale(${event.target.value})`
}

const handleCompassImageInputChange = (event) => {
	const [image] = compassImageInput.files
	if(image){
		for(const direction of compassDirections){
			direction.style.display = "none";
		}
		compass.style.backgroundImage = `url(${URL.createObjectURL(image)})`
	}
}

const compassDefaultBounds = {
	height:compass.style.height,
	width:compass.style.width,
	borderRadius:compass.style.borderRadius
}

const handleCompassBoundsInputChange = (event) => {
	const {checked} = event.target

	if(checked){
		compass.style.height = "100%"
		compass.style.width = "100%"
		compass.style.borderRadius = "unset"
	}
	else{
		compass.style = {...compass.style, ...compassDefaultBounds}
	}
}

addImageBtn.addEventListener("click", handleAddImageClick)

interact(".draggable")
.draggable({
	inertia:true,
	autoScroll:true,
	listeners:{
		move:(event) => {
			const {target} = event
			var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
			var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy

			target.style.transform = `translate(${x}px, ${y}px)`

			target.setAttribute('data-x', x)
			target.setAttribute('data-y', y)
		}
	}
})

compassResetPositions.addEventListener("click", () => {
	const initialTranslateCoords = "translate(0, 0)"
	document.querySelectorAll(".layer").forEach(layer => {
		layer.style.transform = initialTranslateCoords
	})
	compassContainer.style.transform = initialTranslateCoords
})

if(window.DeviceOrientationEvent && 'ontouchstart' in window){
	isCompassEnabled = true
	window.addEventListener("deviceorientationabsolute", handleDeviceOrientation)
}
else{
	isCompassEnabled = false
}

compassEnabledInput.addEventListener("change", handleCompassEnabledChange)
compassAngleInput.addEventListener("change", handleCompassAngleInputChange)
compassOpacityInput.addEventListener("input", handleCompassOpacityInputChange)
compassSizeInput.addEventListener("input", handleCompassSizeInputChange)
compassImageInput.addEventListener("change", handleCompassImageInputChange)
compassBoundsInput.addEventListener("change", handleCompassBoundsInputChange)
