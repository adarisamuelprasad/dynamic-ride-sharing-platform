$ErrorActionPreference = "Continue"

Write-Host "Searching for Maven wrapper in user home..."

$m2Path = "$env:USERPROFILE\.m2\wrapper\dists"
if (Test-Path $m2Path) {
    # Recursively find mvn.cmd to locate the home
    $mvnExecutable = Get-ChildItem -Path $m2Path -Filter "mvn.cmd" -Recurse | Select-Object -First 1
    
    if ($mvnExecutable) {
        $mvnHome = $mvnExecutable.Directory.Parent.FullName
        Write-Host "Found Maven Home: $mvnHome"
        
        $bootDir = Join-Path $mvnHome "boot"
        $plexusJar = Get-ChildItem -Path $bootDir -Filter "plexus-classworlds-*.jar" | Select-Object -First 1
        
        if ($plexusJar) {
             Write-Host "Found Plexus Jar: $($plexusJar.Name)"
             
             # Construct args
             $javaArgs = @(
                "-Dclassworlds.conf=$mvnHome\bin\m2.conf",
                "-Dmaven.home=$mvnHome",
                "-Dlibrary.jansi.path=$mvnHome\lib\jansi-native",
                "-Dmaven.multiModuleProjectDirectory=$PWD",
                "-classpath",
                "`"$($plexusJar.FullName)`"",
                "org.codehaus.plexus.classworlds.launcher.Launcher",
                "spring-boot:run"
             )
             
             Write-Host "Launching Maven via Java..."
             & java $javaArgs
        } else {
             Write-Error "Could not find plexus-classworlds jar in $bootDir"
        }
    } else {
        Write-Error "Could not find mvn.cmd in $m2Path"
    }
} else {
    Write-Error ".m2 directory not found at $m2Path"
}
