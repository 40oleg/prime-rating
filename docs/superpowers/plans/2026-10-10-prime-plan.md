# Prime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать и опубликовать личный prime-рейтинг как устанавливаемую Angular PWA.

**Architecture:** Чистая математическая модель рассчитывает движение по времени событий. Angular-компоненты показывают состояние и управляют событиями; сервис хранит версионированный журнал на устройстве. Service worker обеспечивает офлайн-работу, GitHub Actions публикует статическую сборку.

**Tech Stack:** Angular CLI текущей стабильной версии, TypeScript, Angular service worker, штатный тестовый runner CLI, GitHub Pages.

**Spec:** [prime-design.md](../specs/2026-10-10-prime-design.md).

## Global Constraints

- GitHub account: 40oleg; repository: prime-rating, если свободно.
- Начальная высота 10, скорость 0, горизонт 730 суток.
- Событие задаёт положительное ускорение и длительность 0 < d < 730 суток.
- Ни высота, ни скорость не меняются скачком при добавлении события.
- Ускорения действующих событий складываются; гравитация пересчитывается при новом событии по формуле спецификации.
- При первом достижении нуля полёт прекращается, новое событие может запустить следующий.
- Русский минималистичный тёмный интерфейс, крупный рейтинг с одним десятичным знаком.
- Данные только на устройстве, UTC timestamps, версия формата 1.
- PWA, HTTPS, офлайн после первого успешного открытия; путь публикации /prime-rating/.
- Репозиторий публичный; пользовательские данные не попадают в Git.
- Рабочая папка исходников: work/prime-rating; документы копируются в docs/superpowers при создании локального репозитория.

## Review Focus

- Новое событие на нулевой высоте должно начать подъём, а не немедленно завершиться из-за корня t = 0.
- Долгое закрытие приложения не должно пропустить первое касание нуля и показать позднейшее восстановление прежнего полёта.
- Повреждённые данные, неизвестная версия и недоступное хранилище должны давать понятное сообщение без молчаливой потери журнала.
- Очень большие числа, NaN, отрицательные значения и длительность 730 должны отклоняться до сохранения.
- Базовый путь Pages должен работать для иконок, manifest, service worker и офлайн-перезапуска.

## Task 1: Модель рейтинга

**Files:** src/app/rating/rating.model.ts; src/app/rating/rating.model.spec.ts; Angular scaffold и package-lock.json.

**Interfaces:**

- PrimeEvent { id: string; name: string; at: number; acceleration: number; durationDays: number }.
- PrimeData { version: 1; startedAt: number; events: PrimeEvent[] }.
- RatingState { height: number; velocity: number; acceleration: number; grounded: boolean }.
- createData(now: number): PrimeData.
- evaluate(data: PrimeData, now: number): RatingState.
- appendEvent(data: PrimeData, event: PrimeEvent): PrimeData.
- validateData(value: unknown): PrimeData — бросает понятную ошибку при некорректном формате.

- [ ] Создать Angular standalone-проект в work/prime-rating; зафиксировать зависимости в lockfile.
- [ ] Написать тесты: evaluate(createData(0), 0).height === 10; height при 730 сутках === 0; на 365 сутках === 7.5.
- [ ] Написать тесты непрерывности: при добавлении события высота и скорость до/после совпадают, ускорение изменяется.
- [ ] Написать тесты суммирования двух воздействий, окончания одного воздействия без скачка скорости и остановки на нуле.
- [ ] Написать тесты первого касания нуля при долгом закрытии, запуска нового полёта на нуле и одинакового расчёта независимо от частоты вызовов evaluate.
- [ ] Написать тесты валидации: reject NaN, Infinity, durationDays <= 0, durationDays >= 730, неизвестную version и несогласованные даты.
- [ ] Запустить npm.cmd test -- --watch=false; подтвердить ошибки из-за отсутствующей реализации.
- [ ] Реализовать интерфейсы по спецификации: аналитические участки постоянного ускорения, корни квадратного уравнения для первого касания пола, защита численной устойчивости.
- [ ] Повторить npm.cmd test -- --watch=false; все тесты проходят.
- [ ] Инициализировать локальный Git и сохранить модель, документы и scaffold коммитом.

## Task 2: Хранение и интерфейс

**Files:** src/app/rating/rating.store.ts; src/app/rating/rating.store.spec.ts; src/app/app.ts; src/app/app.html; src/app/app.css; src/styles.css.

**Consumes:** PrimeData, PrimeEvent, RatingState, createData, evaluate, appendEvent, validateData из Task 1.

**Produces:** RatingStore.data; RatingStore.add(name: string, acceleration: number, durationDays: number): void; RatingStore.exportJson(): string; RatingStore.importJson(text: string): void.

- [ ] Написать тесты восстановления сохранённых данных, отсутствия записи при некорректном вводе, импорта/экспорта, повреждённого JSON и ошибки записи в localStorage.
- [ ] Запустить тесты и подтвердить ожидаемые ошибки отсутствующей реализации.
- [ ] Реализовать store: ключ prime-rating:v1, сохранение только после успешной проверки, сохранение предыдущих данных при ошибке импорта/записи.
- [ ] Реализовать экран: бренд Prime, центральная цифра, направление движения, кнопка добавления; адаптивный layout для телефона и компьютера.
- [ ] Реализовать доступную форму с подписанными полями, ручным ускорением и длительностью, ошибками возле полей и прогнозом перед сохранением.
- [ ] Добавить компактную историю, экспорт JSON, импорт с подтверждением замены, сообщение о локальном хранении.
- [ ] Обновлять отображение по таймеру и при возврате на вкладку; не записывать журнал на каждом тике.
- [ ] Запустить тесты и production build; исправить ошибки.
- [ ] Проверить в браузере добавление события, закрытие формы, перезагрузку, историю и импорт/экспорт; проверить ширины 390 и 1440 px и управление клавиатурой.
- [ ] Сохранить проверенный интерфейс и store коммитом.

## Task 3: PWA и публикация

**Files:** public/manifest.webmanifest; public/icons/*; ngsw-config.json; src/app/app.config.ts; .github/workflows/pages.yml; README.md; .gitignore.

**Consumes:** Production Angular app из Task 2.

**Produces:** Публичный GitHub-репозиторий и проверенный адрес Pages, manifest и service worker.

- [ ] Добавить PWA через официальный schematic @angular/pwa совместимой версии; заменить стандартные иконки собственным простым знаком Prime.
- [ ] Настроить manifest: имя Prime, start_url и scope относительно базового пути, display standalone, theme_color и background_color соответствуют экрану.
- [ ] Добавить кнопку установки по beforeinstallprompt и краткую инструкцию для браузеров без этого события.
- [ ] Настроить Pages workflow: npm ci, тесты без watch, production build с --base-href /prime-rating/, configure-pages, upload-pages-artifact, deploy-pages.
- [ ] Написать README: модель и единицы силы, запуск, тесты, установка PWA, локальное хранение и перенос данных.
- [ ] Выполнить npm.cmd test -- --watch=false и npm.cmd run build -- --base-href /prime-rating/; подтвердить успешный exit code.
- [ ] Проверить production preview: manifest и все иконки возвращают 200, service worker зарегистрирован, после первого открытия офлайн-перезапуск показывает приложение и данные.
- [ ] Создать публичный репозиторий в 40oleg через доступный авторизованный GitHub CLI/API или браузер; проверить имя и отсутствие существующего проекта перед созданием.
- [ ] Отправить исходники и настроить Pages на GitHub Actions; дождаться успешного workflow.
- [ ] Открыть https://40oleg.github.io/prime-rating/ и проверить загрузку, добавление события, manifest и service worker на опубликованном адресе.
- [ ] Передать пользователю ссылки на приложение и репозиторий, краткую инструкцию установки и фактические результаты проверок.

## Execution

Рекомендация: реализация самим агентом в этой беседе. Три задачи последовательно используют общую модель и сервис хранения; отдельные исполнители здесь добавили бы расходы на передачу контекста. Перед завершением — независимая проверка модели, интерфейса и публикации.
