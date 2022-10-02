var isCompassEnabled = true

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

const sidebarItems = document.querySelector(".sidebar-items")

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

const contentLayers = document.querySelector(".content-layers")
const layersWithCompass = []

const handleAddCompassClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	layersWithCompass.push(sidebarItemInd)
	rotateLayersWithCompass(northAngle)
}

const handleImageOpacityChange = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	const opacityValue = parseInt(event.target.value)/100
	contentLayers.children[sidebarItemInd].style.opacity = opacityValue
}

const handleDeleteImageClick = (event, sidebarItem) => {
	const sidebarItemInd = getSidebarItemInd(sidebarItem)
	sidebarItems.removeChild(sidebarItem)
	contentLayers.removeChild(contentLayers.children[sidebarItemInd])
}

/**
 * Add new layer on top of previous layers
 * @param {string} imageURL 
 */
const addLayer = (imageURL) => {
	const layersCount = contentLayers.children.length - 1
	const newLayer = document.createElement("div")
	const newLayerInd = layersCount + 1
	newLayer.className = `content-layer content-layer_${newLayerInd}`
	newLayer.style.backgroundImage = `url(${imageURL})`
	newLayer.style.zIndex = newLayerInd
	contentLayers.append(newLayer)
}

const getSidebarItemInd = (sidebarItem) => {
	const sidebarItemInd = parseInt((sidebarItem.classList[1].split("_"))[1])
	return sidebarItemInd
}

var isCompassEnabled = false
var northAngle = 0
const compass = document.querySelector(".content-directions")
const compassText = document.querySelector(".content-directions__text")
const compassAngleInput = document.querySelector("#compassAngle")

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
		contentLayers.children[layerInd].style.transform = `rotate(${angle}deg)`
	}
	compass.style.transform = `rotate(${angle}deg)`
}

const compassEnabledInput = document.querySelector("#compassEnabled")

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

const compassOpacityInput = document.querySelector("#compassOpacity")

const handleCompassOpacityInputChange = (event) => {
	compass.style.opacity = event.target.value / 100
}

const compassSizeInput = document.querySelector("#compassSize")
const compassContainer = document.querySelector(".content-directions-container")

const handleCompassSizeInputChange = (event) => {
	compassContainer.style.transform = `scale(${event.target.value / 100})`
}

const compassImageInput = document.querySelector("#compassImage")
const compassDirections = document.querySelectorAll(".content-direction")

const handleCompassImageInputChange = (event) => {
	const [image] = compassImageInput.files
	if(image){
		for(const direction of compassDirections){
			direction.style.display = "none";
		}
		compass.style.backgroundImage = `url(${URL.createObjectURL(image)})`
	}
}

addImageBtn.addEventListener("click", handleAddImageClick)
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
