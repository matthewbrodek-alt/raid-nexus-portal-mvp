param(
  [string]$OutputPath = "src\lib\data\champion-multipliers.ts",
  [string]$CacheDir = ".cache\champion-multipliers"
)

$ErrorActionPreference = "Stop"

$rarityUrl = "https://ayumilove.net/raid-shadow-legends-list-of-champions-by-rarity/"
$factions = @{
  "BL" = "Banner Lords"
  "SO" = "The Sacred Order"
  "HE" = "High Elves"
  "BA" = "Barbarians"
  "OT" = "Ogryn Tribes"
  "LZ" = "Lizardmen"
  "SW" = "Skinwalkers"
  "OR" = "Orcs"
  "DS" = "Demonspawn"
  "UH" = "Undead Hordes"
  "DE" = "Dark Elves"
  "KR" = "Knights Revenant"
  "DW" = "Dwarves"
  "SK" = "Shadowkin"
  "SY" = "Sylvan Watchers"
  "AM" = "Argonites"
}

function Read-Url {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$CachePath
  )

  if (Test-Path -LiteralPath $CachePath) {
    return Get-Content -Raw -LiteralPath $CachePath
  }

  $content = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 60 | Select-Object -ExpandProperty Content
  $content | Set-Content -LiteralPath $CachePath -Encoding UTF8
  Start-Sleep -Milliseconds 150
  return $content
}

function Normalize-Text {
  param([string]$Value)

  if ([string]::IsNullOrWhiteSpace($Value)) {
    return ""
  }

  $decoded = [System.Net.WebUtility]::HtmlDecode($Value)
  $withoutTags = [regex]::Replace($decoded, "<[^>]+>", " ")
  return ([regex]::Replace($withoutTags, "\s+", " ")).Trim()
}

function Get-SkillBlocks {
  param([string]$Html)

  $decoded = [System.Net.WebUtility]::HtmlDecode($Html)
  $start = [regex]::Match($decoded, "<h2>[^<]* Skills</h2>", "IgnoreCase")
  if (-not $start.Success) {
    return @()
  }

  $rest = $decoded.Substring($start.Index)
  $end = [regex]::Match($rest, "<h2>[^<]*(Build Guide|Masteries|Videos|Champion Lore|Equipment)[^<]*</h2>|<div id=""equip_placeholder_start""", "IgnoreCase")
  $skillsHtml = if ($end.Success) { $rest.Substring(0, $end.Index) } else { $rest }

  $sections = @()
  $headers = [regex]::Matches($skillsHtml, "<h3>(?<title>.*?)</h3>", "Singleline, IgnoreCase")

  if ($headers.Count -eq 0) {
    $sections += [pscustomobject]@{
      Form = "Default"
      Html = $skillsHtml
    }
    return $sections
  }

  for ($i = 0; $i -lt $headers.Count; $i++) {
    $header = $headers[$i]
    $sectionStart = $header.Index + $header.Length
    $sectionEnd = if ($i -lt ($headers.Count - 1)) { $headers[$i + 1].Index } else { $skillsHtml.Length }
    $title = Normalize-Text $header.Groups["title"].Value

    if ($title -match "Common Skills") {
      continue
    }

    $form = "Default"
    if ($title -match "Base Form") {
      $form = "Base Form"
    } elseif ($title -match "Alternate Form") {
      $form = "Alternate Form"
    }

    $sections += [pscustomobject]@{
      Form = $form
      Html = $skillsHtml.Substring($sectionStart, $sectionEnd - $sectionStart)
    }
  }

  return $sections
}

function Get-DamageSkills {
  param(
    [string]$Html,
    [string]$Rarity
  )

  $skills = @()
  $sections = Get-SkillBlocks $Html

  foreach ($section in $sections) {
    $paragraphs = [regex]::Matches($section.Html, "<p><strong>(?<name>.*?)</strong>(?<body>.*?)</p>", "Singleline, IgnoreCase")
    $slotIndex = 0

    foreach ($paragraph in $paragraphs) {
      $rawName = Normalize-Text $paragraph.Groups["name"].Value
      if ([string]::IsNullOrWhiteSpace($rawName)) {
        continue
      }

      if ($rawName -match "^(Aura|Metamorph|Transfigure|Form Shift|Blessing|Passive)") {
        continue
      }

      $slotIndex += 1
      $body = $paragraph.Groups["body"].Value
      $multiplierMatch = [regex]::Match($body, "Damage Multiplier:\s*(?<multiplier>[^<]+)", "IgnoreCase")
      if (-not $multiplierMatch.Success) {
        continue
      }

      $skillName = ($rawName -replace "\s*\(Cooldown:.*$", "").Trim()
      $slot = "A$slotIndex"

      $skill = [ordered]@{
        slot = $slot
        name = $skillName
        multiplier = (Normalize-Text $multiplierMatch.Groups["multiplier"].Value)
      }

      if ($Rarity -eq "Mythical") {
        $skill["form"] = $section.Form
      }

      $skills += [pscustomobject]$skill
    }
  }

  return $skills
}

New-Item -ItemType Directory -Force -Path $CacheDir | Out-Null
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutputPath) | Out-Null

$rarityCache = Join-Path $CacheDir "rarity.html"
$rarityHtml = Read-Url -Url $rarityUrl -CachePath $rarityCache

$champions = @()
foreach ($rarity in @("Mythical", "Legendary")) {
  $startId = if ($rarity -eq "Mythical") { "mythical" } else { "legendary" }
  $endId = if ($rarity -eq "Mythical") { "legendary" } else { "epic" }
  $sectionMatch = [regex]::Match($rarityHtml, "<h2 id=""$startId"">.*?(?=<h2 id=""$endId"">)", "Singleline, IgnoreCase")
  if (-not $sectionMatch.Success -and $rarity -eq "Legendary") {
    $sectionMatch = [regex]::Match($rarityHtml, "<h2 id=""legendary"">.*?(?=<h2 id=""epic"">|<h2)", "Singleline, IgnoreCase")
  }

  $links = [regex]::Matches($sectionMatch.Value, '<li><a href="(?<url>https://ayumilove\.net/raid-shadow-legends-[^"]+)">(?<text>[^<]+)</a></li>', "IgnoreCase")
  foreach ($link in $links) {
    $text = [System.Net.WebUtility]::HtmlDecode($link.Groups["text"].Value)
    $codeMatch = [regex]::Match($text, "\((?<code>[A-Z]{2})-[LM][A-Z]{2}\)")
    $name = ($text -replace "\s*\([A-Z]{2}-[LM][A-Z]{2}\)\s*$", "").Trim()
    $factionCode = if ($codeMatch.Success) { $codeMatch.Groups["code"].Value } else { "" }

    $champions += [pscustomobject]@{
      nameEn = $name
      rarity = $rarity
      faction = if ($factions.ContainsKey($factionCode)) { $factions[$factionCode] } else { $factionCode }
      sourceUrl = $link.Groups["url"].Value
    }
  }
}

$entries = @()
$total = $champions.Count
$index = 0
foreach ($champion in $champions) {
  $index += 1
  Write-Host "[$index/$total] $($champion.nameEn)"

  try {
    $slug = ($champion.sourceUrl.TrimEnd("/") -split "/")[-1]
    $html = Read-Url -Url $champion.sourceUrl -CachePath (Join-Path $CacheDir "$slug.html")
    $skills = Get-DamageSkills -Html $html -Rarity $champion.rarity

    $entries += [ordered]@{
      nameEn = $champion.nameEn
      rarity = $champion.rarity
      faction = $champion.faction
      sourceUrl = $champion.sourceUrl
      skills = @($skills)
    }
  } catch {
    Write-Warning "Failed: $($champion.nameEn) - $($_.Exception.Message)"
    $entries += [ordered]@{
      nameEn = $champion.nameEn
      rarity = $champion.rarity
      faction = $champion.faction
      sourceUrl = $champion.sourceUrl
      skills = @()
    }
  }
}

$json = $entries | ConvertTo-Json -Depth 8
$ts = @"
export type ChampionDamageSkill = {
  slot: string;
  name: string;
  multiplier: string;
  form?: "Base Form" | "Alternate Form" | "Default";
};

export type ChampionMultiplierEntry = {
  nameEn: string;
  nameRu?: string;
  rarity: "Legendary" | "Mythical";
  faction: string;
  sourceUrl: string;
  skills: ChampionDamageSkill[];
};

export const championMultipliers = $json as const satisfies ChampionMultiplierEntry[];
"@

$ts | Set-Content -LiteralPath $OutputPath -Encoding UTF8
Write-Host "Saved $($entries.Count) entries to $OutputPath"
