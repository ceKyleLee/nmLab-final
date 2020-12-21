# Checkpoint
## 1. 建立帳號系統(個人與公司)
個人帳號: 姓名
公司帳號: 公司名稱
### Frontend
- 確認帳號是否註冊
- 無帳號則跳出註冊頁面，輸入名稱與type(可顯示metamask blockchain 帳號)
- 有帳號則跳進資料頁面，與contract要求帳號內資料

### Contract
- Mapping of address and account
- Interface for register and login(Retreive personal data)
function:
- findAccount ( 確認帳號是否註冊 )
- addAccount ( 新增帳號(兩種type: 個人與公司, 名稱) )
- requireData ( 要求帳號內資料 )

## 2. 上傳個人基本資料、履歷與公司資料
表格形式(固定或可新增欄位)或純文字形式(限制字數)

#### 個人:
聯絡方式
期望薪資
學歷
應徵工作

#### 公司:
介紹
聯絡方式

### Frontend
編輯資料並發送給contract
固定時間render一次頁面重要一次data

### Contract
- Storage for data and resume(IPFS maybe?)
- Interface for retrieve all personal and company data
- Interface for create and update the data and resume
function:
- updateData