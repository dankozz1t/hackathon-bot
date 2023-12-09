require("dotenv").config();

const pilgi = require("./pіlgi");

const { Bot, Keyboard, InputFile, session } = require("grammy");

const bot = new Bot(process.env.BOT_API_KEY);

function initial() {
  return { questionIndex: undefined, score: undefined };
}

let questions = [
  "1. Думки та спогади, що повторюються і турбують, або нав’язливі картини стресового досвіду з минулого?",
  "2. Повторювані, хвилюючі сновидіння про стресовий досвід?",
  "3. Раптове відчуття ніби стресовий досвід знову трапляється (переживаєте ситуацію знову)?",
  "4. Відчуття пригнічення, смутку, коли щось нагадувало вам стресову ситуацію з минулого?",
  "5. Сильні фізичні реакції, коли щось нагадувало про стресовий досвід (наприклад, серцебиття, утруднене дихання,",
  "6. Уникання думок або розмов про стресову ситуацію у минулому або уникання почуттів, пов’язаних з цією ситуацією?",
  "7. Уникання певної діяльності або ситуацій, тому що вони нагадують вам стресову ситуацію з минулого?",
  "8. Труднощі з пригадуванням важливих моментів стресового досвіду з минулого?",
  "9. Сильні негативні переконання про себе, інших людей або навколишній світ (наприклад, «я поганий», «зі мною щось дуже не так», «нікому не можна довіряти», «світ – небезпечне місце»)?",
  "10. Звинувачення себе або інших на рахунок стресового досвіду, або того, що сталося після нього?",
  "11. Сильні негативні емоції, такі як страх, жах, злість, почуття провини або сором?",
  "13. Відчуття віддаленості або відокремленості від інших?",
  "14. Проблеми у переживанні позитивних емоцій (наприклад, незмога відчувати радість або любов до близької людини)?",
  "15. Роздратування, спалахи гніву, агресивна поведінка?",
  "16. Ризикова поведінка, яка може зашкодити?",
  "17. Перебування «на взводі» або «на сторожі»?",
  "18. Відчуття постійної напруги?",
  "19. Труднощі із зосередженістю?",
  "20. Проблеми із засинанням або нічні прокидання?",
];

bot.use(session({ initial }));

function startWellnessTest(ctx) {
  const keyboard = new Keyboard()
    .text("Зовсім ні – 0")
    .text("Трохи – 1")
    .row()
    .text("Помірно – 2")
    .text("Відчутно – 3")
    .row()
    .text("Дуже – 4")
    .row()
    .text("Повернутись до головного меню")
    .text("Допомога спеціаліста");

  ctx.reply(`${questions[0]}`, {
    reply_markup: { keyboard: keyboard.build(), resize_keyboard: true },
  });
  ctx.session.questionIndex = 0;
  ctx.session.score = 0;
}

const mainMenu = new Keyboard()
  .text("Гарантії та пільги")
  .row()
  .text("Пройти тест на посттравматичний стресовий розлад (ПТСР)")
  .row()
  .text("Термінова допомога спеціаліста");

bot.command("start", async (ctx) => {
  console.log(`use start:`, ctx.message.from);

  const localImagePath = "images/header.jpg";
  await ctx.replyWithPhoto(new InputFile(localImagePath), {
    caption: `Привіт! Я твій вірний цифровий помічник у світі ветеранів. 
Обери те, що тебе цікавить у меню: `,
    reply_markup: { keyboard: mainMenu.build(), resize_keyboard: true },
  });
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  console.log(`use text:`, ctx.message.from);
  console.log(`text:`, text);

  const themeMenu = {
    reply_markup: {
      keyboard: new Keyboard()
        .text("Медичні пільги")
        .text("Реабілітація")
        .row()
        .text("Освітні пільги")
        .text("Забезпечення автомобілем та місцем для нього")
        .row()
        .text("Повернутись до головного меню")
        .build(),

      resize_keyboard: true,
    },
  };

  if (text === "Гарантії та пільги") {
    ctx.reply("Оберіть тему:", themeMenu);
  } else if (text === "Медичні пільги") {
    ctx.reply(pilgi.pilgi1, { parse_mode: "HTML" });
  } else if (text === "Реабілітація") {
    ctx.reply(pilgi.pilgi2, { parse_mode: "HTML" });
  } else if (text === "Освітні пільги") {
    ctx.reply(pilgi.pilgi3, { parse_mode: "HTML" });
  } else if (text === "Забезпечення автомобілем та місцем для нього") {
    ctx.reply(pilgi.pilgi4, { parse_mode: "HTML" });
  } else if (
    text === "Пройти тест на посттравматичний стресовий розлад (ПТСР)"
  ) {
    await ctx.reply(
      `<b>Шкала самооцінки проявів посттравматичного стресового розладу (ПТСР). Методика PCL-5</b>
      
Нижче вказані реакції, які іноді бувають після пережитого стресу. Уважно прочитайте кожен пункт та виберіть відповідь, яка відображає, наскільки сильно вас турбувала зазначена проблема протягом останнього місяця.

Всього буде <b>20</b> питань 
      `,
      { parse_mode: "HTML" }
    );

    startWellnessTest(ctx);
  } else if (
    text === "Термінова допомога спеціаліста" ||
    text === "Допомога спеціаліста"
  ) {
    ctx.reply("Надішліть, будь ласка, свій контактний номер:", {
      reply_markup: {
        keyboard: new Keyboard().requestContact("Надіслати контакт").build(),
        resize_keyboard: true,
      },
    });
  } else if (text === "Повернутись до головного меню") {
    ctx.reply("Обери те, що тебе цікавить у меню: ", {
      reply_markup: {
        keyboard: mainMenu.build(),
        resize_keyboard: true,
      },
    });
  } else if (ctx.session?.questionIndex !== undefined) {
    const answerScore = parseInt(text.split(" – ")[1]);

    ctx.session.score += answerScore;
    if (ctx.session?.questionIndex < questions.length - 1) {
      ctx.session.questionIndex++;
      ctx.reply(questions[ctx.session.questionIndex], {
        reply_markup: {
          keyboard: new Keyboard()
            .text("Зовсім ні – 0")
            .text("Трохи – 1")
            .row()
            .text("Помірно – 2")
            .text("Відчутно – 3")
            .row()
            .text("Дуже – 4")
            .row()
            .text("Повернутись до головного меню")
            .text("Допомога спеціаліста")
            .build(),
          resize_keyboard: true,
        },
      });
    } else {
      ctx.reply(
        `Ваш результат:  ${ctx.session.score} балів
      
      
За Вашими результатами ${
          ctx.session.score < 35
            ? "посттравматичний розлад малоймовірний."
            : "є імовірність присутності посттравматичного розладу."
        }
      
Важливо розуміти, що цей тест є доволі корисним у виявленні симптомів ПТСР, однак він не дає можливості діагностувати його. Це може зробити винятково спеціаліст з психічного здоров’я. 

Якщо вас турбують окремі прояви з зазначених вище у сильній формі, рекомендуємо вам звернутися до психолога психотерапевти або ж лікаря психотерапевта.
      `,
        {
          reply_markup: {
            keyboard: new Keyboard()
              .text("Повернутись до головного меню")
              .text("Допомога спеціаліста")
              .build(),
            resize_keyboard: true,
          },
        }
      );
      delete ctx.session.questionIndex;
      delete ctx.session.score;
    }
  } else {
    ctx.reply(
      "Вибачте, але я не розумію що ви маєте на увазі, виберіть щось з меню",
      {
        reply_markup: {
          keyboard: mainMenu.build(),
          resize_keyboard: true,
        },
      }
    );
  }
});

bot.on("message:contact", (ctx) => {
  return ctx.reply(
    "Дякую за надсилання вашого контакту! Наші фахівці зв'яжуться з вами якнайшвидше",
    {
      reply_markup: { keyboard: mainMenu.build(), resize_keyboard: true },
    }
  );
});

bot.start();
