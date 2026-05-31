document.addEventListener('DOMContentLoaded', () => {
  const helpData = {
    price: {
      title: "Средний чек (AOV)",
      text: "Средняя стоимость одного заказа, которую оплачивает клиент.",
      formula: "Заданное пользователем значение"
    },
    cost: {
      title: "Себестоимость",
      text: "Прямые затраты на производство, закупку товара или выполнение услуги.",
      formula: "Заданное пользователем значение"
    },
    expenses: {
      title: "Дополнительные издержки",
      text: "Расходы на упаковку, логистику, менеджмент, эквайринг и прочие сопутствующие траты на один заказ.",
      formula: "Заданное пользователем значение"
    },
    margin: {
      title: "Маржа",
      text: "Грязная прибыль с одного проданного товара или оказанной услуги без учета расходов на маркетинг.",
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
      text: "Какой процент пользователей, совершивших промежуточное действие (например, оставивших заявку на сайте), в итоге покупают товар.",
      formula: "Заданное пользователем значение"
    },
    'tcpa-no-vat': {
      title: "Цена достижения цели (tCPA без НДС)",
      text: "Это значение нужно указывать в поле «Цена достижения цели» в настройках стратегии Яндекс Директа. Здесь рассчитывается сумма без НДС, так как баланс внутри рекламного кабинета отображается «чистым» (без НДС).",
      formula: "Цена достижения цели = (Маржа × % расхода × % выкупа × 100 / (100 + НДС)) × Конверсия в продажу"
    }
  };

  const modal = document.getElementById('helpModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalText = document.getElementById('modalText');
  const modalFormula = document.getElementById('modalFormula');
  const closeModalBtn = document.getElementById('closeModalBtn');

  // Функция открытия модального окна
  function showHelp(id) {
    const data = helpData[id];
    if (!data) return;
    
    modalTitle.innerText = data.title;
    modalText.innerText = data.text;
    modalFormula.innerText = data.formula;
    modal.style.display = 'flex';
  }

  // Функция закрытия
  function closeHelp() {
    modal.style.display = 'none';
  }

  // Навешиваем клики на все кнопки знаков вопроса
  document.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const helpId = btn.getAttribute('data-help');
      showHelp(helpId);
    });
  });

  // Закрытие при клике на крестик
  closeModalBtn.addEventListener('click', closeHelp);

  // Закрытие при клике на область вокруг модального окна
  modal.addEventListener('click', closeHelp);

  // Предотвращаем закрытие при клике внутри самого контента модалки
  document.querySelector('.modal-content').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Логика калькулятора
  const inputIds = ['price', 'cost', 'expenses', 'drr', 'buyout', 'vat', 'cr'];
  const inputs = {};
  inputIds.forEach(id => inputs[id] = document.getElementById(id));
  
  const marginInput = document.getElementById('margin');
  const tcpaNoVatEl = document.getElementById('tcpa-no-vat');

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

    const tcpoVat = margin * drr * buyout;
    const tcpoNoVat = tcpoVat * 100 / (100 + vatPercent);
    const tcpaNoVat = tcpoNoVat * cr;

    tcpaNoVatEl.innerText = formatCurrency(tcpaNoVat);
  }

  function formatCurrency(value) {
    if (value <= 0) return '0 ₽';
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
  }

  inputIds.forEach(id => {
    inputs[id].addEventListener('input', calculate);
  });

  // Первичный расчет
  calculate();
});
