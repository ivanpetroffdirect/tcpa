document.addEventListener('DOMContentLoaded', () => {
  // === БЛОК ПРЕДЗАГРУЗКИ КАРТИНКИ ===
  const preloadImg = new Image();
  preloadImg.src = "https://i.postimg.cc/RV2KTdxk/2026-06-01-11-50-29.png";
  // ==================================

  const helpData = {
    price: {
      title: "Средний чек",
      text: "Средняя стоимость одного заказа, которую оплачивает клиент.",
      formula: "Заданное пользователем значение"
    },
    cost: {
      title: "Себестоимость",
      text: "Затраты на производство, закупку товара или выполнение услуги.",
      formula: "Заданное пользователем значение"
    },
    expenses: {
      title: "Дополнительные издержки",
      text: "Расходы на упаковку, логистику, менеджмент, эквайринг и прочие сопутствующие траты на один заказ.",
      formula: "Заданное пользователем значение"
    },
    margin: {
      title: "Маржа",
      text: "Доход с одного проданного товара без учета маркетинга.",
      formula: "Маржа = Средний чек - Себестоимость - Издержки"
    },
    drr: {
      title: "Желаемый % расхода от маржи",
      text: "Какую долю от маржи вы готовы инвестировать в привлечение одного покупателя. Если не знаете, что указать, оставьте значение по умолчанию 40%.",
      formula: "Заданное пользователем значение"
    },
    buyout: {
      title: "Процент выкупа и возвраты",
      text: "Доля заказов, которые клиенты реально оплатили и забрали (учитывает отказы на ПВЗ или возвраты).",
      formula: "Заданное пользователем значение"
    },
    vat: {
      title: "Процент НДС",
      text: "Ставка налога на добавленную стоимость для расчета очищенных от налогов показателей.",
      formula: "Заданное пользователем значение"
    },
    cr: {
      title: "Конверсия из цели в продажу",
      text: "Какой процент пользователей, совершивших это действие (например, оставивших заявку на сайте), в итоге покупают товар.",
      formula: "Заданное пользователем значение"
    },
    'tcpa-no-vat': {
      title: "Цена за достижение цели tCPA",
      text: "Это значение нужно указывать в поле «Цена достижения цели» в настройках стратегии Яндекс Директа. Здесь рассчитывается сумма без указанного выше НДС, так как баланс внутри рекламного кабинета отображается без НДС.",
      formula: "Цена за достижение цели tCPA = (Маржа × % расхода × % выкупа × 100 / (100 + НДС)) × Конверсия в продажу"
    },
    'tcpo-no-vat': {
      title: "Цена за привлечение заказа tCPO",
      text: "Целевая цена за привлечение одной продажи без НДС. Укажите это значение в настройках стратегии Яндекс Директа, если в качестве цели указываете не промежуточную цель на сайте типа «клик по кнопке» или «заявка», а непосредственно оформление заказа.",
      formula: "Цена за продажу tCPO = Маржа × % расхода × % выкупа × 100 / (100 + НДС)"
    }
  };

  const modal = document.getElementById('helpModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalFormula = document.getElementById('modalFormula');
  const modalImageWrapper = document.getElementById('modalImageWrapper');
  const modalImage = document.getElementById('modalImage');
  const closeModalBtn = document.getElementById('closeModalBtn');

  function showHelp(id) {
    const data = helpData[id];
    if (!data) return;
    
    modalTitle.classList.remove('modal-title-descriptor');
    modalTitle.innerText = data.title;
    modalText.innerText = data.text;
    modalFormula.innerText = data.formula;
    
    modalText.style.display = 'block';
    modalFormula.style.display = 'block';
    modalImageWrapper.style.display = 'none';
    
    modal.style.display = 'flex';
  }

  function showImageModal(imgUrl, titleText) {
    modalTitle.classList.add('modal-title-descriptor');
    modalTitle.innerText = titleText;
    modalImage.src = imgUrl;
    
    modalText.style.display = 'none';
    modalFormula.style.display = 'none';
    modalImageWrapper.style.display = 'block';
    
    modal.style.display = 'flex';
  }

  function closeHelp() {
    modal.style.display = 'none';
    modalImage.src = '';
  }

  document.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const helpId = btn.getAttribute('data-help');
      showHelp(helpId);
    });
  });

  document.querySelectorAll('.help-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgUrl = link.getAttribute('data-help-img');
      const customTitle = "Скриншот из Мастера кампаний с указанием цели и ценой за ее достижение";
      showImageModal(imgUrl, customTitle);
    });
  });

  closeModalBtn.addEventListener('click', closeHelp);
  modal.addEventListener('click', closeHelp);
  document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const inputIds = ['price', 'cost', 'expenses', 'drr', 'buyout', 'vat', 'cr'];
  const inputs = {};
  inputIds.forEach(id => inputs[id] = document.getElementById(id));
  
  const marginInput = document.getElementById('margin');
  const tcpaNoVatEl = document.getElementById('tcpa-no-vat');
  const tcpoNoVatEl = document.getElementById('tcpo-no-vat'); // Новый элемент
  
  let currentRawTcpa = 0;
  let currentRawTcpo = 0;

  function calculate() {
    const price = parseFloat(inputs.price.value) || 0;
    const cost = parseFloat(inputs.cost.value) || 0;
    const expenses = parseFloat(inputs.expenses.value) || 0;
    
    const drr = (parseFloat(inputs.drr.value) || 0) / 100;
    const buyout = (parseFloat(inputs.buyout.value) || 0) / 100;
    const vatPercent = parseFloat(inputs.vat.value) || 0;
    const cr = (parseFloat(inputs.cr.value) || 0) / 100;

    const margin = price - cost - expenses;
    marginInput.value = margin;

    // Расчет tCPO (Цена за продажу без НДС)
    const tcpoVat = margin * drr * buyout;
    const tcpoNoVat = tcpoVat * 100 / (100 + vatPercent);
    currentRawTcpo = Math.round(tcpoNoVat);

    // Расчет tCPA (Цена за промежуточную цель без НДС)
    currentRawValue = Math.round(tcpoNoVat * cr); // Сохраняем логику для обратной совместимости
    currentRawTcpa = currentRawValue;

    tcpaNoVatEl.innerText = formatCurrency(currentRawTcpa);
    tcpoNoVatEl.innerText = formatCurrency(currentRawTcpo);
  }

  function formatCurrency(value) {
    if (value <= 0) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  }

  // Копирование для tCPA
  tcpaNoVatEl.addEventListener('click', () => {
    if (currentRawTcpa <= 0) return;
    navigator.clipboard.writeText(currentRawTcpa.toString()).then(() => {
      tcpaNoVatEl.setAttribute('data-tooltip', 'Скопировано');
    });
  });

  tcpaNoVatEl.addEventListener('mouseleave', () => {
    tcpaNoVatEl.setAttribute('data-tooltip', 'Скопировать');
  });

  // Копирование для tCPO
  tcpoNoVatEl.addEventListener('click', () => {
    if (currentRawTcpo <= 0) return;
    navigator.clipboard.writeText(currentRawTcpo.toString()).then(() => {
      tcpoNoVatEl.setAttribute('data-tooltip', 'Скопировано');
    });
  });

  tcpoNoVatEl.addEventListener('mouseleave', () => {
    tcpoNoVatEl.setAttribute('data-tooltip', 'Скопировать');
  });

  inputIds.forEach(id => {
    inputs[id].addEventListener('input', calculate);
  });

  calculate();
});
