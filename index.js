require("dotenv").config();

const { Bot, Keyboard, InputFile, session } = require("grammy");
const bot = new Bot(process.env.BOT_API_KEY);

const benefits = require("./benefitsInformation");
const questionsPTSD = require("./testQuestionsPTSD");

function initialSession() {
  return { questionIndex: undefined, score: undefined };
}
bot.use(session({ initial: initialSession }));

function createMainMenu() {
  return new Keyboard()
    .text("Гарантії та пільги")
    .row()
    .text("Пройти тест на посттравматичний стресовий розлад (ПТСР)")
    .row()
    .text("Термінова допомога спеціаліста")
    .build();
}

function createWellnessTestKeyboard() {
  return new Keyboard()
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
    .build();
}

function createThemeMenu() {
  return new Keyboard()
    .text("Медичні пільги")
    .text("Реабілітація")
    .row()
    .text("Освітні пільги")
    .text("Забезпечення автомобілем та місцем для нього")
    .row()
    .text("Повернутись до головного меню")
    .build();
}

bot.command("start", async (ctx) => {
  console.log(`--logs-- use start:`, ctx.message.from);

  const localImagePath = "images/header.jpg";
  await ctx.replyWithPhoto(new InputFile(localImagePath), {
    caption:
      "Привіт! Я твій вірний цифровий помічник у світі ветеранів. Обери те, що тебе цікавить у меню:",
    reply_markup: { keyboard: createMainMenu(), resize_keyboard: true },
  });
});

bot.on("message:text", async (ctx) => {
  const text = ctx.message.text;
  console.log(`--logs-- use text:`, ctx.message.from);
  console.log(`--logs-- text:`, text);

  switch (text) {
    case "Гарантії та пільги":
      await ctx.reply("Оберіть тему:", {
        reply_markup: { keyboard: createThemeMenu(), resize_keyboard: true },
      });
      break;
    case "Медичні пільги":
      await ctx.reply(benefits.medicalBenefits, { parse_mode: "HTML" });
      break;
    case "Реабілітація":
      await ctx.reply(benefits.rehabilitation, { parse_mode: "HTML" });
      break;
    case "Освітні пільги":
      await ctx.reply(benefits.educationalBenefits, { parse_mode: "HTML" });
      break;
    case "Забезпечення автомобілем та місцем для нього":
      await ctx.reply(benefits.vehicleProvision, { parse_mode: "HTML" });
      break;
    case "Пройти тест на посттравматичний стресовий розлад (ПТСР)":
      await startWellnessTest(ctx);
      break;
    case "Термінова допомога спеціаліста":
    case "Допомога спеціаліста":
      await requestContact(ctx);
      break;
    case "Повернутись до головного меню":
      await ctx.reply("Обери те, що тебе цікавить у меню:", {
        reply_markup: { keyboard: createMainMenu(), resize_keyboard: true },
      });
      break;
    default:
      await handleDefault(ctx, text);
      break;
  }
});

async function startWellnessTest(ctx) {
  ctx.reply(`${questionsPTSD[0]}`, {
    reply_markup: {
      keyboard: createWellnessTestKeyboard(),
      resize_keyboard: true,
    },
  });
  ctx.session.questionIndex = 0;
  ctx.session.score = 0;
}

async function requestContact(ctx) {
  ctx.reply("Надішліть, будь ласка, свій контактний номер:", {
    reply_markup: {
      keyboard: new Keyboard().requestContact("Надіслати контакт").build(),
      resize_keyboard: true,
    },
  });
}

async function handleDefault(ctx, text) {
  if (ctx.session?.questionIndex !== undefined && text.includes("–")) {
    await handleTestResponse(ctx, text);
  } else {
    ctx.reply(
      "Вибачте, але я не розумію що ви маєте на увазі, виберіть щось з меню",
      {
        reply_markup: { keyboard: createMainMenu(), resize_keyboard: true },
      }
    );
  }
}

async function handleTestResponse(ctx, text) {
  const answerScore = parseInt(text.split(" – ")[1]);
  ctx.session.score += answerScore;

  if (ctx.session?.questionIndex < questionsPTSD.length - 1) {
    ctx.session.questionIndex++;
    ctx.reply(questionsPTSD[ctx.session.questionIndex], {
      reply_markup: {
        keyboard: createWellnessTestKeyboard(),
        resize_keyboard: true,
      },
    });
  } else {
    await completeWellnessTest(ctx);
  }
}

async function completeWellnessTest(ctx) {
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

bot.on("message:contact", async (ctx) => {
  await ctx.reply(
    "Дякую за надсилання вашого контакту! Наші фахівці зв'яжуться з вами якнайшвидше",
    {
      reply_markup: { keyboard: createMainMenu(), resize_keyboard: true },
    }
  );
});

bot.start();
