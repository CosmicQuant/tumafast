const fs = require('fs');

const file = 'components/MapLayer.tsx';
let data = fs.readFileSync(file, 'utf8');

const regex = /const executeCinematicFly = \(\) => \{\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\n.*\}\;/g;

const newCode = `const executeCinematicFly = () => {
      // Clear out outstanding timeouts
      cameraTimeoutsRef.current.forEach(clearTimeout);
      cameraTimeoutsRef.current = [];

      map.panTo(boundsToFit[0]);
      
      const stepInterval = 100;
      
      const smoothZoom = (targetZoom: number, onComplete?: () => void) => {
        const cz = map.getZoom() || 14;
        if (cz === targetZoom) {
          if (onComplete) {
            const t = setTimeout(onComplete, 50);
            cameraTimeoutsRef.current.push(t);
          }
          return;
        }
        
        const step = cz < targetZoom ? 1 : -1;
        map.setZoom(cz + step);
        const t = setTimeout(() => smoothZoom(targetZoom, onComplete), stepInterval);
        cameraTimeoutsRef.current.push(t);
      };

      if (boundsToFit.length === 1) {
        smoothZoom(19);
      } else {
        const bounds = new google.maps.LatLngBounds();
        boundsToFit.forEach(coord => bounds.extend(coord));
        const center = bounds.getCenter();
        
        map.panTo(center);
        
        const cz = map.getZoom() || 14;
        if (cz > 14) {
          smoothZoom(14, () => map.fitBounds(bounds, dynamicPadding));
        } else {
          const t = setTimeout(() => map.fitBounds(bounds, dynamicPadding), 200);
          cameraTimeoutsRef.current.push(t);
        }
      }
    };`;

console.log(data.match(/const executeCinematicFly = \(\) => \{[\s\S]*?\}\;/)?.[0]);
// Instead of huge regex, let's just replace the exact block.
const modified = data.replace(/const executeCinematicFly = \(\) => \{[\s\S]*?    \};\n/g, newCode + '\n');
fs.writeFileSync(file, modified);
console.log('Done');
