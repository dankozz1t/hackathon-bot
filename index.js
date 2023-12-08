require("dotenv").config();
const { Bot, Keyboard, InputFile, session } = require("grammy");

const bot = new Bot(process.env.BOT_API_KEY);

function initial() {
  return { questionIndex: undefined, score: undefined };
}
bot.use(session({ initial }));

function startWellnessTest(ctx) {
  const questions = ["Питання 1", "Питання 2"];

  const keyboard = new Keyboard()
    .text("Зовсім ні – 0")
    .row()
    .text("Трохи – 1")
    .row()
    .text("Помірно – 2")
    .row()
    .text("Відчутно – 3")
    .row()
    .text("Дуже – 4");

  ctx.reply(`${questions[0]}`, {
    reply_markup: { keyboard: keyboard.build(), resize_keyboard: true },
  });
  ctx.session.questionIndex = 0;
  ctx.session.score = 0;
}

const mainMenu = new Keyboard()
  .text("Інформація про пільги")
  .row()
  .text("Пройти тест на самопочуття")
  .row()
  .text("Термінова допомога спеціаліста");

bot.command("start", async (ctx) => {
  console.log(`use start:`, ctx.message.from);

  const localImagePath = "images/first.jpg";
  await ctx.replyWithPhoto(new InputFile(localImagePath), {
    caption: "Вітаю! Оберіть опцію:",
    reply_markup: { keyboard: mainMenu.build(), resize_keyboard: true },
  });
});

bot.on("message:text", (ctx) => {
  const text = ctx.message.text;
  console.log(`use text:`, ctx.message.from);
  console.log(`text:`, text);

  const themeMenu = {
    reply_markup: {
      keyboard: new Keyboard()
        .text("Тема1")
        .text("Тема2")
        .row()
        .text("Тема3")
        .text("Тема4")
        .row()
        .text("Повернутись до головного меню")
        .build(),

      resize_keyboard: true,
    },
  };

  if (text === "Інформація про пільги") {
    ctx.reply("Оберіть тему:", themeMenu);
  } else if (text === "Тема1") {
    ctx.reply("Інформація про Тему1", themeMenu);
  } else if (text === "Тема2") {
    ctx.reply("Інформація про Тему2", themeMenu);
  } else if (text === "Тема3") {
    ctx.reply("Інформація про Тему3", themeMenu);
  } else if (text === "Тема4") {
    ctx.reply("Інформація про Тема4", themeMenu);
  } else if (text === "Пройти тест на самопочуття") {
    startWellnessTest(ctx);
  } else if (text === "Термінова допомога спеціаліста") {
    ctx.reply("Надішліть, будь ласка, свій контактний номер:", {
      reply_markup: {
        keyboard: new Keyboard().requestContact("Надіслати контакт").build(),
        resize_keyboard: true,
      },
    });
  } else if (ctx.session?.questionIndex !== undefined) {
    console.log(`ctx.session?.questionIndex:`, ctx.session?.questionIndex);
    const answerScore = parseInt(text.split(" – ")[1]);
    const questions = ["Питання 1", "Питання 2"];

    ctx.session.score += answerScore;
    if (ctx.session?.questionIndex < questions.length - 1) {
      ctx.session.questionIndex++;
      ctx.reply(questions[ctx.session.questionIndex], {
        reply_markup: {
          keyboard: new Keyboard()
            .text("Зовсім ні – 0")
            .row()
            .text("Трохи – 1")
            .row()
            .text("Помірно – 2")
            .row()
            .text("Відчутно – 3")
            .row()
            .text("Дуже – 4")
            .build(),
          resize_keyboard: true,
        },
      });
    } else {
      ctx.reply(`Ваш результат: ${ctx.session.score}`, {
        reply_markup: {
          keyboard: new Keyboard()
            .text("Повернутись до головного меню")
            .build(),
          resize_keyboard: true,
        },
      });
      delete ctx.session.questionIndex;
      delete ctx.session.score;
    }
  } else if (text === "Повернутись до головного меню") {
    ctx.reply("Вітаю! Оберіть опцію:", {
      reply_markup: {
        keyboard: mainMenu.build(),
        resize_keyboard: true,
      },
    });
  } else {
    ctx.reply("Не розумію, виберіть щось з меню", {
      reply_markup: {
        keyboard: mainMenu.build(),
        resize_keyboard: true,
      },
    });
  }
});

bot.on("message:contact", (ctx) => {
  return ctx.reply("Дякую за надсилання вашого контакту!", {
    reply_markup: { keyboard: mainMenu.build(), resize_keyboard: true },
  });
});

bot.start();
