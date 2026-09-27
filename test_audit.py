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
        await asyncio.sleep(3)

        # Evaluate translations in the browser runtime
        test_terms = [
            'fourth ventricle',
            'third ventricle',
            'greater omentum',
            'lesser omentum',
            'ascending colon',
            'descending colon',
            'sigmoid colon',
            'left atrium',
            'right ventricle',
            'anterior interventricular artery',
            'fifth metatarsal bone.l',
            'anterior tibiofibular ligament.r',
            'biceps brachii.l',
            'sternocleidomastoid.r',
            'recurrent laryngeal nerve.l',
            'brachiocephalic trunk',
            'medulla oblongata.l'
        ]

        results = await page.evaluate("""(terms) => {
            return terms.map(t => ({
                term: t,
                vi: translateToVietnameseMedical(t),
                latin: translateToLatinMedical(t)
            }));
        }""", test_terms)

        with open('audit_results.txt', 'w', encoding='utf-8') as out:
            out.write("=== VERIFIED NETTER VIETNAMESE TRANSLATION AUDIT ===\n")
            all_passed = True
            for r in results:
                line = f"  {r['term']:35s} -> VI: {r['vi']:35s} | LATIN: {r['latin']}\n"
                out.write(line)
                print(f"  {r['term']:35s} -> VI: {r['vi'].encode('ascii', 'backslashreplace').decode()}")
                # Check for bad patterns
                bad_words = ['lớn omentum', 'trái tâm', 'phải tâm', 'thứ tư tâm', 'lên đại tràng', 'xuống đại tràng', 'thứ năm đốt']
                for b in bad_words:
                    if b in r['vi'].lower():
                        print(f"    FAILED: Detected bad pattern '{b}' in '{r['vi']}'")
                        all_passed = False

        print(f"\nAll critical terms passed audit: {all_passed}")

        # Open 3D models and search for 'Tâm nhĩ'
        print("\nOpening 3D model and searching for 'Tâm nhĩ'...")
        await page.evaluate("""() => {
            selectHubMode('models');
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = 'Xương đốt bàn chân';
                searchInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }""")
        await asyncio.sleep(1.5)

        # Capture screenshot
        await page.screenshot(path="C:/Users/MinhTriet/.gemini/antigravity/brain/6f55e3b5-6c58-4bee-a69a-c949ecfe66f4/netter_vietnam_audit_search.png")
        print("Captured netter_vietnam_audit_search.png")

        if console_errors:
            print("Console errors:", console_errors)
        else:
            print("Zero console errors!")

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
