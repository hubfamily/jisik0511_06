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

    // 메뉴 표시 (알레르기 정보 포함)
    const menuItems = mealInfo.DDISH_NM.split('<br/>');
    const menuItemsWithAllergy = menuItems.map(item => {
        const match = item.match(/(.*?)\((.*?)\)/);
        if (match) {
            const [_, menu, allergyInfo] = match;
            return {
                name: menu.replace('@', '').trim(),
                allergy: allergyInfo.split('.').map(num => num.trim()).filter(num => num)
            };
        }
        return {
            name: item.replace('@', '').trim(),
            allergy: []
        };
    });

    menuList.innerHTML = `
        <h2><i class="fas fa-hamburger"></i> 오늘의 메뉴</h2>
        ${menuItemsWithAllergy.map(item => `
            <div class="menu-item">
                <i class="fas fa-utensil-spoon"></i>
                ${item.name}
                ${item.allergy.length > 0 ? 
                    `<span class="allergy-info" title="알레르기 유발 식품">
                        <i class="fas fa-exclamation-circle"></i> 
                        ${item.allergy.join(', ')}
                    </span>` : 
                    ''}
            </div>
        `).join('')}
    `;

    // 영양정보 표시
    const nutritionValues = {
        '단백질': '34.9g',
        '지방': '20.9g',
        '비타민A': '30.4R.E',
        '티아민': '0.3mg',
        '리보플라빈': '0.3mg',
        '비타민C': '7.5mg',
        '칼슘': '159.1mg',
        '철분': '3.1mg'
    };

    const nutritionItems = Object.entries(nutritionValues).map(([label, value]) => ({
        icon: getNutritionIcon(label),
        label,
        value
    }));

    nutritionInfo.innerHTML = `
        <h2><i class="fas fa-chart-pie"></i> 영양 정보</h2>
        ${nutritionItems.map(item => `
            <div class="nutrition-item">
                <i class="fas ${item.icon}"></i>
                ${item.label}: ${item.value}
            </div>
        `).join('')}
    `;

    // 원산지 정보 표시
    const originItems = mealInfo.ORPLC_INFO.split('<br/>').filter(item => item.trim());
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

function getNutritionIcon(nutrient) {
    const icons = {
        '단백질': 'fa-dna',
        '지방': 'fa-oil-can',
        '비타민A': 'fa-eye',
        '티아민': 'fa-apple-whole',
        '리보플라빈': 'fa-b',
        '비타민C': 'fa-lemon',
        '칼슘': 'fa-bone',
        '철분': 'fa-magnet'
    };
    return icons[nutrient] || 'fa-info-circle';
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
