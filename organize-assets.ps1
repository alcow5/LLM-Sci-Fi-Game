# Organize Kenney Sci-Fi RTS Assets
# This script moves assets from the kenney_sci-fi-rts folder to the correct game folders

Write-Host "Organizing Kenney Sci-Fi RTS Assets..." -ForegroundColor Green

# Create directories if they don't exist
$directories = @(
    "assets/tilesets",
    "assets/sprites", 
    "assets/ui",
    "assets/environment",
    "assets/structures"
)

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Copy tileset
if (Test-Path "assets/kenney_sci-fi-rts/Tilesheet/scifi_tilesheet.png") {
    Copy-Item "assets/kenney_sci-fi-rts/Tilesheet/scifi_tilesheet.png" "assets/tilesets/sci-fi-rts.png" -Force
    Write-Host "Copied tileset to assets/tilesets/sci-fi-rts.png" -ForegroundColor Green
}

# Copy spritesheets for player and NPCs
if (Test-Path "assets/kenney_sci-fi-rts/Spritesheet/scifiRTS_spritesheet.png") {
    Copy-Item "assets/kenney_sci-fi-rts/Spritesheet/scifiRTS_spritesheet.png" "assets/sprites/player.png" -Force
    Copy-Item "assets/kenney_sci-fi-rts/Spritesheet/scifiRTS_spritesheet.png" "assets/sprites/npc.png" -Force
    Write-Host "Copied spritesheet to assets/sprites/player.png and npc.png" -ForegroundColor Green
}

# Copy individual unit sprites for better NPC variety
if (Test-Path "assets/kenney_sci-fi-rts/PNG/Default size/Unit") {
    $unitFiles = Get-ChildItem "assets/kenney_sci-fi-rts/PNG/Default size/Unit" -Filter "*.png"
    foreach ($file in $unitFiles) {
        Copy-Item $file.FullName "assets/sprites/$($file.Name)" -Force
    }
    Write-Host "Copied $($unitFiles.Count) unit sprites to assets/sprites/" -ForegroundColor Green
}

# Copy structure sprites
if (Test-Path "assets/kenney_sci-fi-rts/PNG/Default size/Structure") {
    $structureFiles = Get-ChildItem "assets/kenney_sci-fi-rts/PNG/Default size/Structure" -Filter "*.png"
    foreach ($file in $structureFiles) {
        Copy-Item $file.FullName "assets/structures/$($file.Name)" -Force
    }
    Write-Host "Copied $($structureFiles.Count) structure sprites to assets/structures/" -ForegroundColor Green
}

# Copy environment sprites
if (Test-Path "assets/kenney_sci-fi-rts/PNG/Default size/Environment") {
    $envFiles = Get-ChildItem "assets/kenney_sci-fi-rts/PNG/Default size/Environment" -Filter "*.png"
    foreach ($file in $envFiles) {
        Copy-Item $file.FullName "assets/environment/$($file.Name)" -Force
    }
    Write-Host "Copied $($envFiles.Count) environment sprites to assets/environment/" -ForegroundColor Green
}

# Copy individual tile sprites for map decoration
if (Test-Path "assets/kenney_sci-fi-rts/PNG/Default size/Tile") {
    $tileFiles = Get-ChildItem "assets/kenney_sci-fi-rts/PNG/Default size/Tile" -Filter "*.png"
    foreach ($file in $tileFiles) {
        Copy-Item $file.FullName "assets/tilesets/$($file.Name)" -Force
    }
    Write-Host "Copied $($tileFiles.Count) tile sprites to assets/tilesets/" -ForegroundColor Green
}

# Create simple UI elements from existing sprites
if (Test-Path "assets/sprites/scifiUnit_01.png") {
    Copy-Item "assets/sprites/scifiUnit_01.png" "assets/ui/button.png" -Force
    Copy-Item "assets/sprites/scifiUnit_02.png" "assets/ui/panel.png" -Force
    Write-Host "Created UI elements from unit sprites" -ForegroundColor Green
}

Write-Host ""
Write-Host "Asset organization complete!" -ForegroundColor Green
Write-Host "You can now delete the kenney_sci-fi-rts folder if desired." -ForegroundColor Yellow 