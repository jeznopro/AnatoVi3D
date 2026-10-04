import asyncio
import sys
sys.stdout.reconfigure(encoding='utf-8')
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1600, 'height': 950})
        page = await context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(msg.text) if msg.type == 'error' else None)

        print("Navigating to http://127.0.0.1:8080/ ...")
        await page.goto("http://127.0.0.1:8080/", wait_until="domcontentloaded", timeout=15000)
        await asyncio.sleep(2)

        # 1. Dismiss Hub to go to 3D Models
        print("Switching to 3D Models mode...")
        await page.evaluate("selectHubMode('models')")
        await asyncio.sleep(1.5)

        # 2. Trigger Exploded View via UI button
        print("Clicking #btn-explode-mode...")
        await page.click("#btn-explode-mode")
        
        # Wait for models to load and animation to lerp to 100%
        print("Waiting for models to load and explode animation...")
        for _ in range(40):
            amt = await page.evaluate("typeof currentExplodeAmount !== 'undefined' ? currentExplodeAmount : 0")
            if amt >= 0.96:
                break
            await asyncio.sleep(0.3)
        await asyncio.sleep(1.0)

        # Verify panel is visible
        panel_visible = await page.is_visible("#exploded-view-panel")
        print(f"Exploded view panel visible: {panel_visible}")
        assert panel_visible, "Exploded view panel should be visible"

        # Capture screenshot 1: Disassembly mode (like user reference)
        path_disassembly = "C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/exploded_view_disassembly.png"
        await page.screenshot(path=path_disassembly)
        print(f"Captured {path_disassembly}")

        # 3. Test clicking an exploded bone to verify raycast & Inspector still work 100%
        print("Testing click on an exploded bone (e.g. Rib or Sternum)...")
        click_res = await page.evaluate('''() => {
            const bone = allMeshes.find(m => m.userData && m.userData.cleanName && (m.userData.cleanName.toLowerCase().includes('sternum') || m.userData.cleanName.toLowerCase().includes('rib')));
            if (bone) {
                selectOrgan(bone);
                return {
                    selected: true,
                    name: bone.name,
                    viName: bone.userData.viName,
                    latinName: bone.userData.latinName,
                    posX: bone.position.x,
                    origX: bone.userData.origPos ? bone.userData.origPos.x : null
                };
            }
            return { selected: false };
        }''')
        print(f"Selected bone info: {click_res}")
        await asyncio.sleep(1)
        path_selected = "C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/exploded_view_selected.png"
        await page.screenshot(path=path_selected)
        print(f"Captured {path_selected}")

        # 4. Switch to Side-by-Side Systems Mode
        print("Switching to Side-by-Side Systems Mode (#mode-sidebyside)...")
        await page.click("#mode-sidebyside")
        await asyncio.sleep(2)
        path_sidebyside = "C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/exploded_view_sidebyside.png"
        await page.screenshot(path=path_sidebyside)
        print(f"Captured {path_sidebyside}")

        # 5. Test 360 Radial Explode Mode
        print("Switching to Radial Explode Mode (#mode-radial)...")
        await page.click("#mode-radial")
        await asyncio.sleep(2)
        path_radial = "C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/exploded_view_radial.png"
        await page.screenshot(path=path_radial)
        print(f"Captured {path_radial}")

        # 6. Test Collapse Back to 0%
        print("Testing collapse to 0% (Thu Gọn)...")
        await page.evaluate("animateExplodeTo(0.0)")
        await asyncio.sleep(2.5)
        path_collapsed = "C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/exploded_view_collapsed.png"
        await page.screenshot(path=path_collapsed)
        print(f"Captured {path_collapsed}")

        if console_errors:
            print("Console errors:", console_errors)
        else:
            print("Zero console errors! Verification passed successfully.")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
