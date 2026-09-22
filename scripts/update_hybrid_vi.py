#!/usr/bin/env python3
"""
Merge hybrid cervical parts into data/bodyparts3d_vi.json
"""
import json

def update_vi_dict():
    with open('data/hybrid_cervical_meta.json', 'r', encoding='utf-8') as f:
        meta_list = json.load(f)

    with open('data/bodyparts3d_vi.json', 'r', encoding='utf-8') as f:
        vi_data = json.load(f)

    parts_dict = vi_data.get('parts', {})

    sys_vi_names = {
        'arterial': 'Hệ Động Mạch',
        'venous': 'Hệ Tĩnh Mạch',
        'nervous': 'Hệ Thần Kinh'
    }

    for m in meta_list:
        pid = 'HYBRID_' + m['name'].replace('.', '_').replace(' ', '_').replace('(', '').replace(')', '')
        name_lower = m['name'].lower()
        if 'external carotid' in name_lower:
            desc = 'Động mạch cảnh ngoài - Tách từ ĐM cảnh chung ở ngang bờ trên sụn giáp (C4), đi qua tam giác Farabeuf sâu dưới cơ nhị thân và chui vào tuyến mang tai chia 2 ngành cùng (ĐM thái dương nông và ĐM hàm trên). Cấp máu cho toàn bộ vùng cổ, đầu và mặt.'
        elif 'common facial' in name_lower:
            desc = 'Thân tĩnh mạch giáp - lưỡi - mặt (Thân Farabeuf) - Hợp lưu của tĩnh mạch mặt, tĩnh mạch lưỡi và tĩnh mạch giáp trên đổ vào tĩnh mạch cảnh trong. Tạo nên giới hạn dưới của Tam giác Farabeuf (mốc phẫu thuật quan trọng tìm ĐM cảnh ngoài).'
        elif 'internal jugular' in name_lower:
            desc = 'Tĩnh mạch cảnh trong (đoạn cổ) - Thân tĩnh mạch lớn nhất ở cổ thu nhận máu từ não, mặt và cổ. Tạo nên giới hạn sau của Tam giác Farabeuf.'
        elif 'hypoglossal' in name_lower:
            desc = 'Thần kinh hạ thiệt (dây thần kinh sọ số XII) - Chi phối vận động toàn bộ các cơ nội tại và ngoại lai của lưỡi. Bắt chéo phía ngoài ĐM cảnh trong và ĐM cảnh ngoài, tạo nên giới hạn trên của Tam giác Farabeuf.'
        elif 'facial nerve' in name_lower:
            desc = 'Thần kinh mặt (dây thần kinh sọ số VII) - Chi phối vận động các cơ biểu cảm nét mặt. Đi qua tuyến mang tai ở lớp nông nhất, bắt chéo phía ngoài tĩnh mạch cảnh ngoài và động mạch cảnh ngoài.'
        elif 'facial artery' in name_lower:
            desc = 'Động mạch mặt - Nhánh bên trước của ĐM cảnh ngoài, bắt chéo bờ dưới xương hàm dưới ở góc trước cơ cắn (mốc bắt mạch mặt) để lên vùng mặt.'
        elif 'superficial temporal' in name_lower:
            desc = 'Động mạch thái dương nông - Ngành cùng của ĐM cảnh ngoài, đi lên trước tai (nơi có mốc bắt mạch thái dương nông) cấp máu cho vùng thái dương và đỉnh sọ.'
        elif 'maxillary' in name_lower:
            desc = 'Động mạch hàm trên - Ngành cùng lớn hơn của ĐM cảnh ngoài, đi sâu vào hố dưới thái dương và hố chân bướm khẩu cái, cấp máu cho hàm răng, mũi, khẩu cái và màng não (ĐM màng não giữa).'
        elif 'submental' in name_lower:
            desc = 'Động mạch dưới cằm - Nhánh lớn nhất của ĐM mặt ở vùng cổ, chạy nông dưới cơ hàm móng cấp máu cho sàn miệng và dưới cằm.'
        elif 'lingual vein' in name_lower:
            desc = 'Tĩnh mạch lưỡi - Dẫn lưu máu từ lưỡi và sàn miệng đổ vào Thân tĩnh mạch giáp - lưỡi - mặt (Thân Farabeuf).'
        elif 'superior thyroid vein' in name_lower:
            desc = 'Tĩnh mạch giáp trên - Dẫn lưu máu từ cực trên tuyến giáp đổ vào Thân tĩnh mạch giáp - lưỡi - mặt (Thân Farabeuf).'
        else:
            sys_name = sys_vi_names.get(m['system'], m['system'])
            desc = f"Cấu trúc giải phẫu thuộc {sys_name}. Nguồn: Mô hình giải phẫu ghép nối siêu chi tiết (Hybrid Integration)."

        entry = {
            'id': pid,
            'name': m['name'],
            'vi': m['vi'],
            'latin': m['latin'],
            'system': m['system'],
            'desc': desc
        }
        parts_dict[pid] = entry
        parts_dict[m['name']] = entry

    vi_data['parts'] = parts_dict
    with open('data/bodyparts3d_vi.json', 'w', encoding='utf-8') as f:
        json.dump(vi_data, f, ensure_ascii=False, indent=2)

    print(f"Updated data/bodyparts3d_vi.json with {len(meta_list)} hybrid entries.")

if __name__ == '__main__':
    update_vi_dict()
