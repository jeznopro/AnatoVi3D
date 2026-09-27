import json
import re
import os

# 1. Load exact 3D base terms
with open('data/exact_3d_base_terms.json', 'r', encoding='utf-8') as f:
    base_terms = json.load(f)

# 2. Load existing dictionaries
with open('data/netter_vietnam_dictionary.json', 'r', encoding='utf-8') as f:
    netter_data = json.load(f)
existing_vi = netter_data.get('vi', {})
existing_latin = netter_data.get('latin', {})

with open('data/anatomy_data.json', 'r', encoding='utf-8') as f:
    anat_data = json.load(f)
trans_dict = {k.lower().strip(): v for k, v in anat_data.get('translations', {}).items()}
latin_dict = {k.lower().strip(): v for k, v in anat_data.get('latin', {}).items()}

def get_netter_vietnamese(term, fallback_vi):
    t = term.lower().strip()

    # Ventricles & Brain
    if t == 'fourth ventricle': return 'Não thất IV'
    if t == 'third ventricle': return 'Não thất III'
    if t == 'lateral ventricle': return 'Não thất bên'
    if t == 'medulla oblongata': return 'Hành não'
    if t == 'pons': return 'Cầu não'
    if t == 'midbrain': return 'Trung não'
    if t in ('pyramid of medulla oblongata', 'pyramid of medulla'): return 'Tháp hành'
    if t == 'olive': return 'Trám hành'
    if t == 'cerebellum': return 'Tiểu não'
    if t == 'cerebrum': return 'Đại não'
    if t == 'corpus callosum': return 'Thể chai'
    if t == 'thalamus': return 'Đồi thị'
    if t == 'hypothalamus': return 'Vùng hạ đồi'
    if t == 'epithalamus': return 'Vùng trên đồi'
    if t == 'subthalamus': return 'Vùng dưới đồi'
    if t == 'aqueduct of midbrain': return 'Cống trung não (Cống Sylvius)'
    if t == 'angular gyrus': return 'Hồi góc'
    if t == 'supramarginal gyrus': return 'Hồi trên viền'
    if t == 'cingulate gyrus': return 'Hồi đai'
    if t == 'uncus': return 'Móc hải mã'
    if t == 'hippocampus': return 'Hải mã'
    if t == 'dentate gyrus': return 'Hồi răng'
    if t == 'precentral gyrus': return 'Hồi trước trung tâm'
    if t == 'postcentral gyrus': return 'Hồi sau trung tâm'
    if t == 'superior temporal gyrus': return 'Hồi thái dương trên'
    if t == 'middle temporal gyrus': return 'Hồi thái dương giữa'
    if t == 'inferior temporal gyrus': return 'Hồi thái dương dưới'
    if t == 'superior frontal gyrus': return 'Hồi trán trên'
    if t == 'middle frontal gyrus': return 'Hồi trán giữa'
    if t == 'inferior frontal gyrus': return 'Hồi trán dưới'
    if t == 'central sulcus': return 'Rãnh trung tâm (Rãnh Rolando)'
    if t == 'lateral sulcus': return 'Rãnh bên (Rãnh Sylvius)'

    # Cranial Nerves
    if t in ('olfactory nerve', 'olfactory nerve (i)'): return 'Thần kinh khứu giác (I)'
    if t in ('optic nerve', 'optic nerve (ii)'): return 'Thần kinh thị giác (II)'
    if t == 'optic chiasm': return 'Giao thoa thị giác'
    if t == 'optic tract': return 'Dải thị giác'
    if t in ('oculomotor nerve', 'oculomotor nerve (iii)'): return 'Thần kinh vận nhãn (III)'
    if t in ('trochlear nerve', 'trochlear nerve (iv)'): return 'Thần kinh ròng rọc (IV)'
    if t in ('trigeminal nerve', 'trigeminal nerve (v)'): return 'Thần kinh sinh ba (V)'
    if t in ('ophthalmic nerve', 'ophthalmic nerve (v1)'): return 'Thần kinh mắt (V1)'
    if t in ('maxillary nerve', 'maxillary nerve (v2)'): return 'Thần kinh hàm trên (V2)'
    if t in ('mandibular nerve', 'mandibular nerve (v3)'): return 'Thần kinh hàm dưới (V3)'
    if t in ('abducens nerve', 'abducens nerve (vi)'): return 'Thần kinh vận nhãn ngoài (VI)'
    if t in ('facial nerve', 'facial nerve (vii)'): return 'Thần kinh mặt (VII)'
    if t in ('vestibulocochlear nerve', 'vestibulocochlear nerve (viii)'): return 'Thần kinh tiền đình - ốc tai (VIII)'
    if t in ('glossopharyngeal nerve', 'glossopharyngeal nerve (ix)'): return 'Thần kinh thiệt hầu (IX)'
    if t in ('vagus nerve', 'vagus nerve (x)'): return 'Thần kinh lang thang (X)'
    if t in ('accessory nerve', 'accessory nerve (xi)'): return 'Thần kinh phụ (XI)'
    if t in ('hypoglossal nerve', 'hypoglossal nerve (xii)'): return 'Thần kinh hạ thiệt (XII)'
    
    # Heart Chambers, Valves & Vessels
    if t == 'left atrium': return 'Tâm nhĩ trái'
    if t == 'right atrium': return 'Tâm nhĩ phải'
    if t == 'left ventricle': return 'Tâm thất trái'
    if t == 'right ventricle': return 'Tâm thất phải'
    if t == 'interatrial septum': return 'Vách gian nhĩ'
    if t == 'interventricular septum': return 'Vách gian thất'
    if t == 'fossa ovalis': return 'Hố bầu dục'
    if t in ('mitral valve', 'bicuspid valve'): return 'Van hai lá'
    if t == 'tricuspid valve': return 'Van ba lá'
    if t == 'aortic valve': return 'Van động mạch chủ'
    if t == 'pulmonary valve': return 'Van thân động mạch phổi'
    if t == 'anterior interventricular artery': return 'Động mạch gian thất trước'
    if t == 'posterior interventricular artery': return 'Động mạch gian thất sau'
    if t in ('circumflex artery of heart', 'circumflex branch of left coronary artery'): return 'Nhánh mũ của động mạch vành trái'
    if t == 'left coronary artery': return 'Động mạch vành trái'
    if t == 'right coronary artery': return 'Động mạch vành phải'
    if t == 'coronary sinus': return 'Xoang vành'
    if t == 'great cardiac vein': return 'Tĩnh mạch tim lớn'
    if t == 'middle cardiac vein': return 'Tĩnh mạch tim giữa'
    if t == 'small cardiac vein': return 'Tĩnh mạch tim nhỏ'
    if t == 'anterior cardiac veins': return 'Các tĩnh mạch tim trước'
    if 'inferior vein of left ventricle' in t: return 'Tĩnh mạch sau (dưới) của tâm thất trái'
    if t == 'septal papillary muscle of right ventricle': return 'Cơ nhú vách của tâm thất phải'
    if t == 'anterior papillary muscle of right ventricle': return 'Cơ nhú trước của tâm thất phải'
    if t == 'posterior papillary muscle of right ventricle': return 'Cơ nhú sau của tâm thất phải'
    if t == 'anterior papillary muscle of left ventricle': return 'Cơ nhú trước của tâm thất trái'
    if t == 'posterior papillary muscle of left ventricle': return 'Cơ nhú sau của tâm thất trái'
    if t == 'ascending aorta': return 'Động mạch chủ lên'
    if t == 'descending aorta': return 'Động mạch chủ xuống'
    if t == 'aortic arch': return 'Cung động mạch chủ'
    if t == 'thoracic aorta': return 'Động mạch chủ ngực'
    if t == 'abdominal aorta': return 'Động mạch chủ bụng'
    if t == 'pulmonary trunk': return 'Thân động mạch phổi'
    if t == 'brachiocephalic trunk': return 'Thân cánh tay - đầu'
    if t == 'superior vena cava': return 'Tĩnh mạch chủ trên'
    if t == 'inferior vena cava': return 'Tĩnh mạch chủ dưới'

    # Viscera & Gastrointestinal
    if t == 'greater omentum': return 'Mạc nối lớn'
    if t == 'lesser omentum': return 'Mạc nối nhỏ'
    if t == 'meso-appendix': return 'Mạc treo ruột thừa'
    if t == 'mesocolon': return 'Mạc treo đại tràng'
    if t == 'transverse mesocolon': return 'Mạc treo đại tràng ngang'
    if t == 'sigmoid mesocolon': return 'Mạc treo đại tràng sigma'
    if t == 'ascending colon': return 'Đại tràng lên'
    if t == 'descending colon': return 'Đại tràng xuống'
    if t == 'transverse colon': return 'Đại tràng ngang'
    if t == 'sigmoid colon': return 'Đại tràng sigma'
    if t == 'cecum': return 'Manh tràng'
    if t in ('appendix', 'vermiform appendix'): return 'Ruột thừa'
    if t == 'rectum': return 'Trực tràng'
    if t == 'anal canal': return 'Ống hậu môn'
    if t == 'stomach': return 'Dạ dày'
    if t == 'duodenum': return 'Tá tràng'
    if t == 'jejunum': return 'Hỗng tràng'
    if t == 'ileum': return 'Hồi tràng'
    if t == 'liver': return 'Gan'
    if t == 'gallbladder': return 'Túi mật'
    if t == 'pancreas': return 'Tuyến tụy'
    if t == 'spleen': return 'Lách (Lá lách)'
    if t == 'kidney': return 'Thận'
    if t == 'ureter': return 'Niệu quản'
    if t in ('urinary bladder', 'bladder'): return 'Bàng quang'
    if t == 'trachea': return 'Khí quản'
    if t in ('esophagus', 'oesophagus'): return 'Thực quản'
    if t == 'thyroid gland': return 'Tuyến giáp'
    if t == 'parathyroid gland': return 'Tuyến cận giáp'
    if t == 'free taenia': return 'Dải tự do (đại tràng)'
    if t == 'omental taenia': return 'Dải mạc nối (đại tràng)'
    if t == 'mesocolic taenia': return 'Dải mạc treo (đại tràng)'

    # Metatarsals, Metacarpals, Ribs, Phalanges
    roman = {'first': 'I', 'second': 'II', 'third': 'III', 'fourth': 'IV', 'fifth': 'V'}
    for word, num in roman.items():
        if t == f'{word} metatarsal bone': return f'Xương đốt bàn chân {num}'
        if t == f'{word} metacarpal bone': return f'Xương đốt bàn tay {num}'
        if t == f'tuberosity of {word} metatarsal bone': return f'Lồi củ xương đốt bàn chân {num}'
        if t == f'tuberosity of {word} metacarpal bone': return f'Lồi củ xương đốt bàn tay {num}'
        if t == f'styloid process of {word} metacarpal bone': return f'Mỏm trâm xương đốt bàn tay {num}'
        if t == f'{word} rib': return f'Xương sườn {num}'
        if t == f'costal cartilage of {word} rib': return f'Sụn sườn {num}'

    extra_ribs = {'sixth': 'VI', 'seventh': 'VII', 'eighth': 'VIII', 'ninth': 'IX', 'tenth': 'X', 'eleventh': 'XI', 'twelfth': 'XII'}
    for word, num in extra_ribs.items():
        if t == f'{word} rib': return f'Xương sườn {num}'
        if t == f'costal cartilage of {word} rib': return f'Sụn sườn {num}'

    # Brachial Plexus
    if t == 'roots of brachial plexus': return 'Các rễ của đám rối cánh tay'
    if t == 'superior trunk of brachial plexus': return 'Thân trên đám rối cánh tay'
    if t == 'middle trunk of brachial plexus': return 'Thân giữa đám rối cánh tay'
    if t == 'inferior trunk of brachial plexus': return 'Thân dưới đám rối cánh tay'
    if t == 'lateral cord of brachial plexus': return 'Bó ngoài đám rối cánh tay'
    if t == 'medial cord of brachial plexus': return 'Bó trong đám rối cánh tay'
    if t == 'posterior cord of brachial plexus': return 'Bó sau đám rối cánh tay'
    if t == 'anterior division of superior trunk of brachial plexus': return 'Ngành trước thân trên đám rối cánh tay'
    if t == 'posterior division of superior trunk of brachial plexus': return 'Ngành sau thân trên đám rối cánh tay'
    if t == 'anterior division of middle trunk of brachial plexus': return 'Ngành trước thân giữa đám rối cánh tay'
    if t == 'posterior division of middle trunk of brachial plexus': return 'Ngành sau thân giữa đám rối cánh tay'
    if t == 'anterior division of inferior trunk of brachial plexus': return 'Ngành trước thân dưới đám rối cánh tay'
    if t == 'posterior division of inferior trunk of brachial plexus': return 'Ngành sau thân dưới đám rối cánh tay'

    # Iliac & Mandibular Divisions
    if t == 'anterior division of internal iliac artery': return 'Ngành trước của động mạch chậu trong'
    if t == 'posterior division of internal iliac artery': return 'Ngành sau của động mạch chậu trong'
    if t == 'anterior division of retromandibular vein': return 'Nhánh trước tĩnh mạch sau hàm'
    if t == 'posterior division of retromandibular vein': return 'Nhánh sau tĩnh mạch sau hàm'
    if t == 'anterior division of mandibular nerve': return 'Phân nhánh trước của thần kinh hàm dưới'
    if t == 'posterior division of mandibular nerve': return 'Phân nhánh sau của thần kinh hàm dưới'

    # Cutaneous Nerves
    if t == 'posterior femoral cutaneous nerve': return 'Thần kinh bì đùi sau'
    if t == 'anterior root of posterior femoral cutaneous nerve': return 'Rễ trước thần kinh bì đùi sau'
    if t == 'posterior root of posterior femoral cutaneous nerve': return 'Rễ sau thần kinh bì đùi sau'
    if t == 'lateral femoral cutaneous nerve': return 'Thần kinh bì đùi ngoài'
    if t == 'medial antebrachial cutaneous nerve': return 'Thần kinh bì cẳng tay trong'
    if t == 'lateral antebrachial cutaneous nerve': return 'Thần kinh bì cẳng tay ngoài'
    if t == 'posterior antebrachial cutaneous nerve': return 'Thần kinh bì cẳng tay sau'
    if t == 'medial brachial cutaneous nerve': return 'Thần kinh bì cánh tay trong'
    if t == 'inferior lateral brachial cutaneous nerve': return 'Thần kinh bì cánh tay ngoài dưới'
    if t == 'superior lateral brachial cutaneous nerve': return 'Thần kinh bì cánh tay ngoài trên'
    if t == 'posterior brachial cutaneous nerve': return 'Thần kinh bì cánh tay sau'
    if t == 'anterior branch of medial antebrachial cutaneous nerve': return 'Nhánh trước thần kinh bì cẳng tay trong'
    if t == 'posterior branch of medial antebrachial cutaneous nerve': return 'Nhánh sau thần kinh bì cẳng tay trong'

    # Intercostal
    if t == 'posterior intercostal arteries': return 'Các động mạch gian sườn sau'
    if t == 'second posterior intercostal artery': return 'Động mạch gian sườn sau II'
    if t == 'intercostal nerves': return 'Các thần kinh gian sườn'
    if t == 'supreme intercostal artery': return 'Động mạch gian sườn trên cùng'
    if t == 'right superior intercostal vein': return 'Tĩnh mạch gian sườn trên phải'
    if t == 'left superior intercostal vein': return 'Tĩnh mạch gian sườn trên trái'
    if t == 'internal intercostal membrane': return 'Màng gian sườn trong'
    if t == 'internal intercostal muscles': return 'Các cơ gian sườn trong'
    if t == 'external intercostal muscles': return 'Các cơ gian sườn ngoài'
    if t == 'innermost intercostal muscles': return 'Các cơ gian sườn trong cùng'

    # Digital & Peripheral branches
    if t == 'proper palmar digital branches of median nerve': return 'Các nhánh thần kinh gan ngón tay riêng (TK giữa)'
    if t == 'proper palmar digital branches of ulnar nerve': return 'Các nhánh thần kinh gan ngón tay riêng (TK trụ)'
    if t == 'proper plantar digital branches of lateral plantar nerve': return 'Các nhánh thần kinh gan ngón chân riêng (TK gan chân ngoài)'
    if t == 'proper plantar digital branches of medial plantar nerve': return 'Các nhánh thần kinh gan ngón chân riêng (TK gan chân trong)'
    if t == 'muscular branches of deep fibular nerve': return 'Các nhánh cơ của thần kinh mác sâu'
    if t == 'muscular branches of median nerve': return 'Các nhánh cơ của thần kinh giữa'
    if t == 'muscular branches of ulnar nerve': return 'Các nhánh cơ của thần kinh trụ'
    if t == 'sural communicating branch of common fibular nerve': return 'Nhánh thông mác (của thần kinh mác chung)'

    # Cerebral Arteries
    if t == 'anterior cerebral artery': return 'Động mạch não trước'
    if t == 'middle cerebral artery': return 'Động mạch não giữa'
    if t == 'posterior cerebral artery': return 'Động mạch não sau'

    # Tibiofibular & Leg Ligaments
    if t == 'anterior tibiofibular ligament': return 'Dây chằng chày - mác trước'
    if t == 'posterior tibiofibular ligament': return 'Dây chằng chày - mác sau'
    if t == 'transverse tibiofibular ligament': return 'Dây chằng chày - mác ngang'
    if t == 'anterior cruciate ligament': return 'Dây chằng chéo trước'
    if t == 'posterior cruciate ligament': return 'Dây chằng chéo sau'
    if t == 'fibular collateral ligament': return 'Dây chằng bên mác'
    if t == 'tibial collateral ligament': return 'Dây chằng bên chày'
    if t == 'interosseous membrane of leg': return 'Màng gian cốt cẳng chân'
    if t == 'interosseous membrane of forearm': return 'Màng gian cốt cẳng tay'

    # Ear Ossicles
    if t == 'malleus': return 'Xương búa'
    if t == 'incus': return 'Xương đe'
    if t == 'stapes': return 'Xương bàn đạp'

    # Regex cleanup on fallback
    v = fallback_vi
    v = re.sub(r'\bLên đại tràng\b', 'Đại tràng lên', v)
    v = re.sub(r'\bXuống đại tràng\b', 'Đại tràng xuống', v)
    v = re.sub(r'\bSigma đại tràng\b', 'Đại tràng sigma', v)
    v = re.sub(r'\bLớn omentum\b', 'Mạc nối lớn', v)
    v = re.sub(r'\bNhỏ omentum\b', 'Mạc nối nhỏ', v)
    v = re.sub(r'\bBé omentum\b', 'Mạc nối nhỏ', v)
    v = re.sub(r'\bTrái tâm nhĩ\b', 'Tâm nhĩ trái', v)
    v = re.sub(r'\bPhải tâm nhĩ\b', 'Tâm nhĩ phải', v)
    v = re.sub(r'\bTrái tâm thất\b', 'Tâm thất trái', v)
    v = re.sub(r'\bPhải tâm thất\b', 'Tâm thất phải', v)
    v = re.sub(r'\bThứ tư tâm thất\b', 'Não thất IV', v)
    v = re.sub(r'\bThứ ba tâm thất\b', 'Não thất III', v)
    v = re.sub(r'Động mạch trước gian thất', 'Động mạch gian thất trước', v)
    v = re.sub(r'Động mạch sau gian thất', 'Động mạch gian thất sau', v)
    v = re.sub(r'Dây chằng trước chày mác', 'Dây chằng chày - mác trước', v)
    v = re.sub(r'Dây chằng sau chày mác', 'Dây chằng chày - mác sau', v)
    v = re.sub(r'Dây chằng ngang chày mác', 'Dây chằng chày - mác ngang', v)
    v = re.sub(r'của Trái tâm thất', 'của tâm thất trái', v)
    v = re.sub(r'của Phải tâm thất', 'của tâm thất phải', v)
    v = re.sub(r'của Trái tâm nhĩ', 'của tâm nhĩ trái', v)
    v = re.sub(r'của Phải tâm nhĩ', 'của tâm nhĩ phải', v)
    v = re.sub(r'Thần kinh sau đùi bì', 'Thần kinh bì đùi sau', v)
    v = re.sub(r'Thần kinh ngoài đùi bì', 'Thần kinh bì đùi ngoài', v)
    v = re.sub(r'Thần kinh trong cẳng tay bì', 'Thần kinh bì cẳng tay trong', v)
    v = re.sub(r'Thần kinh ngoài cẳng tay bì', 'Thần kinh bì cẳng tay ngoài', v)
    v = re.sub(r'Thần kinh sau cẳng tay bì', 'Thần kinh bì cẳng tay sau', v)
    v = re.sub(r'Thần kinh trong cánh tay bì', 'Thần kinh bì cánh tay trong', v)
    v = re.sub(r'Các động mạch sau gian sườn', 'Các động mạch gian sườn sau', v)
    v = re.sub(r'Trước phân nhánh của Đám rối dưới thân của cánh tay', 'Ngành trước thân dưới đám rối cánh tay', v)
    v = re.sub(r'Trước phân nhánh của Đám rối giữa thân của cánh tay', 'Ngành trước thân giữa đám rối cánh tay', v)
    v = re.sub(r'Trước phân nhánh của Đám rối trên thân của cánh tay', 'Ngành trước thân trên đám rối cánh tay', v)
    v = re.sub(r'Sau phân nhánh của Đám rối dưới thân của cánh tay', 'Ngành sau thân dưới đám rối cánh tay', v)
    v = re.sub(r'Sau phân nhánh của Đám rối giữa thân của cánh tay', 'Ngành sau thân giữa đám rối cánh tay', v)
    v = re.sub(r'Sau phân nhánh của Đám rối trên thân của cánh tay', 'Ngành sau thân trên đám rối cánh tay', v)
    v = re.sub(r'Trước phân nhánh của Động mạch trong chậu', 'Ngành trước của động mạch chậu trong', v)
    v = re.sub(r'Sau phân nhánh của Động mạch trong chậu', 'Ngành sau của động mạch chậu trong', v)
    v = re.sub(r'Trước phân nhánh của Thần kinh hàm dưới', 'Phân nhánh trước của thần kinh hàm dưới', v)
    v = re.sub(r'Sau phân nhánh của Thần kinh hàm dưới', 'Phân nhánh sau của thần kinh hàm dưới', v)
    v = re.sub(r'Trước phân nhánh của Tĩnh mạch sau hàm', 'Nhánh trước tĩnh mạch sau hàm', v)
    v = re.sub(r'Sau phân nhánh của Tĩnh mạch sau hàm', 'Nhánh sau tĩnh mạch sau hàm', v)
    v = re.sub(r'Cơ vách nhú của Phải tâm thất', 'Cơ nhú vách của tâm thất phải', v)
    
    # Specific ordinal regex for digits
    v = re.sub(r'Xương thứ\s+năm\s+đốt bàn chân', 'Xương đốt bàn chân V', v)
    v = re.sub(r'Xương thứ\s+tư\s+đốt bàn chân', 'Xương đốt bàn chân IV', v)
    v = re.sub(r'Xương thứ\s+ba\s+đốt bàn chân', 'Xương đốt bàn chân III', v)
    v = re.sub(r'Xương thứ\s+hai\s+đốt bàn chân', 'Xương đốt bàn chân II', v)
    v = re.sub(r'Xương thứ\s+nhất\s+đốt bàn chân', 'Xương đốt bàn chân I', v)

    v = re.sub(r'Xương thứ\s+năm\s+đốt bàn tay', 'Xương đốt bàn tay V', v)
    v = re.sub(r'Xương thứ\s+tư\s+đốt bàn tay', 'Xương đốt bàn tay IV', v)
    v = re.sub(r'Xương thứ\s+ba\s+đốt bàn tay', 'Xương đốt bàn tay III', v)
    v = re.sub(r'Xương thứ\s+hai\s+đốt bàn tay', 'Xương đốt bàn tay II', v)
    v = re.sub(r'Xương thứ\s+nhất\s+đốt bàn tay', 'Xương đốt bàn tay I', v)

    if v and len(v) > 1:
        v = v[0].upper() + v[1:]
    return v

# Build the complete dictionary
verified_vi = {}
verified_latin = {}

for term in base_terms.keys():
    fallback_vi = existing_vi.get(term) or trans_dict.get(term) or term
    fallback_lat = existing_latin.get(term) or latin_dict.get(term) or term
    clean_vi = get_netter_vietnamese(term, fallback_vi)
    
    verified_vi[term] = clean_vi
    verified_latin[term] = fallback_lat

print(f"Total base terms processed: {len(verified_vi)}")

# Also generate variants with lateral indicators (.l, .r, _l, _r, etc.)
# so that direct lookups in NETTER_VIETNAM_3D_DICTIONARY will hit immediately!
variants_vi = {}
variants_latin = {}

for term, vi in verified_vi.items():
    lat = verified_latin[term]
    
    # Store base term
    variants_vi[term] = vi
    variants_latin[term] = lat
    
    # Check if term already has side info
    has_side_vi = ('trái' in vi.lower() or 'phải' in vi.lower())
    
    # Add .l / _l / .r / _r
    vi_l = vi if has_side_vi else f"{vi} (trái)"
    vi_r = vi if has_side_vi else f"{vi} (phải)"
    
    variants_vi[f"{term}.l"] = vi_l
    variants_vi[f"{term}.r"] = vi_r
    variants_vi[f"{term}_l"] = vi_l
    variants_vi[f"{term}_r"] = vi_r
    variants_vi[f"{term} l"] = vi_l
    variants_vi[f"{term} r"] = vi_r
    
    variants_latin[f"{term}.l"] = lat
    variants_latin[f"{term}.r"] = lat
    variants_latin[f"{term}_l"] = lat
    variants_latin[f"{term}_r"] = lat

print(f"Total entries with lateral variants: {len(variants_vi)}")

# Save to data/netter_vietnam_dictionary.json
netter_output = {
    'vi': variants_vi,
    'latin': variants_latin
}

with open('data/netter_vietnam_dictionary.json', 'w', encoding='utf-8') as f:
    json.dump(netter_output, f, ensure_ascii=False, indent=2)

print("Saved data/netter_vietnam_dictionary.json")

# Update data/anatomy_data.json
anat_trans = anat_data.get('translations', {})
anat_lat = anat_data.get('latin', {})

# Update all matching keys in anatomy_data.json
for k, v in variants_vi.items():
    anat_trans[k] = v
for k, v in variants_latin.items():
    anat_lat[k] = v

# Also sweep all 71,000 entries in anatomy_data for old inversions
clean_sweep_count = 0
for k in list(anat_trans.keys()):
    val = anat_trans[k]
    fixed_val = get_netter_vietnamese(k, val)
    if fixed_val != val:
        anat_trans[k] = fixed_val
        clean_sweep_count += 1

print(f"Clean sweep updated {clean_sweep_count} entries across the entire 71,000-term database.")

anat_data['translations'] = anat_trans
anat_data['latin'] = anat_lat

with open('data/anatomy_data.json', 'w', encoding='utf-8') as f:
    json.dump(anat_data, f, ensure_ascii=False, indent=2)

print("Saved data/anatomy_data.json successfully.")
