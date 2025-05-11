// 현재 날짜를 기본값으로 설정
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('mealDate').value = today;
    getMealInfo();
});

// 날짜 입력 필드에서 엔터 키 처리
document.getElementById('mealDate').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        getMealInfo();
    }
});

async function getMealInfo() {
    const dateInput = document.getElementById('mealDate').value;
    const formattedDate = dateInput.replace(/-/g, '');
    const button = document.querySelector('button');
    const originalButtonText = button.innerHTML;
    
    // 로딩 상태 표시
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 로딩중...';
    button.disabled = true;
    
    const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7530553&MLSV_YMD=${formattedDate}&Type=json`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.RESULT || !data.mealServiceDietInfo) {
            showError('해당 날짜의 급식 정보가 없습니다.');
            return;
        }

        const mealInfo = data.mealServiceDietInfo[1].row[0];
        displayMealInfo(mealInfo);
    } catch (error) {
        showError('급식 정보를 불러오는데 실패했습니다. 잠시 후 다시 시도해주세요.');
        console.error('Error:', error);
    } finally {
        // 버튼 상태 복구
        button.innerHTML = originalButtonText;
        button.disabled = false;
    }
}

function displayMealInfo(mealInfo) {
    const mealInfoDiv = document.getElementById('mealInfo');
    const menuList = document.getElementById('menuList');
    const nutritionInfo = document.getElementById('nutritionInfo');
    const originInfo = document.getElementById('originInfo');

    // 메뉴 표시
    const menuItems = mealInfo.DDISH_NM.split('<br/>');
    menuList.innerHTML = `
        <h2><i class="fas fa-hamburger"></i> 오늘의 메뉴</h2>
        ${menuItems.map(item => `
            <div class="menu-item">
                <i class="fas fa-utensil-spoon"></i>
                ${item.trim()}
            </div>
        `).join('')}
    `;

    // 영양정보 표시
    const nutritionItems = [
        { icon: 'fa-fire', label: '칼로리', value: mealInfo.CAL_INFO },
        { icon: 'fa-dna', label: '단백질', value: mealInfo.NTR_INFO },
        { icon: 'fa-oil-can', label: '지방', value: mealInfo.MLSV_FROM_YMD },
        { icon: 'fa-apple-whole', label: '탄수화물', value: mealInfo.MLSV_TO_YMD }
    ];

    nutritionInfo.innerHTML = `
        <h2><i class="fas fa-chart-pie"></i> 영양 정보</h2>
        ${nutritionItems.map(item => `
            <div class="nutrition-item">
                <i class="fas ${item.icon}"></i>
                ${item.label}: ${item.value || 'N/A'}
            </div>
        `).join('')}
    `;

    // 원산지 정보 표시
    const originItems = mealInfo.ORPLC_INFO.split('<br/>');
    originInfo.innerHTML = `
        <h2><i class="fas fa-globe-asia"></i> 원산지 정보</h2>
        ${originItems.map(item => `
            <div class="origin-item">
                <i class="fas fa-map-marker-alt"></i>
                ${item.trim()}
            </div>
        `).join('')}
    `;

    // 애니메이션 효과를 위해 active 클래스 제거 후 추가
    mealInfoDiv.classList.remove('active');
    setTimeout(() => {
        mealInfoDiv.classList.add('active');
    }, 10);
}

function showError(message) {
    const mealInfoDiv = document.getElementById('mealInfo');
    mealInfoDiv.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            ${message}
        </div>
    `;
    mealInfoDiv.classList.add('active');
}
