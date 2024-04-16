const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(require('ffmpeg-static'));


function convertAudio(input, output) {
    return new Promise((resolve, reject) => {
        ffmpeg(input)
            .output(output)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}

const botCore = {
    telegramAPI: "7085622701:AAGcqbHcBtOtf7X4nFW8UMZLIut0Jx4J0yc",
    telegramChatID: "-1002097976976",
    // backendURL: "http://localhost:3010",
    backendURL: "https://ai-backend-wine.vercel.app/",
    frontendURL: "https://www.solanai.net/",
    running: "./media/running.mp4",
    failed: "./media/error.mp4",
    success: "./media/success.mp4",
    getMessage: function (_message) {
        if (typeof _message === 'undefined' || _message === null) {
            return 'Error';
        }
        return _message.split(' ').slice(1).join(' ');
    },
    randomNumber(max) {
        return Math.floor(Math.random() * (max + 1));
    },
    tokenCommands: [
        {
            _type: "price",
            message: null,
        },
        {
            _type: "contract",
            message: `J2QbNBR5Pu35vSz59fmwfdRic5HHqsZ9C7HfC65EUBQC`
        },
        {
            _type: "ca",
            message: `J2QbNBR5Pu35vSz59fmwfdRic5HHqsZ9C7HfC65EUBQC`
        },
        {
            _type: "sc",
            message: `J2QbNBR5Pu35vSz59fmwfdRic5HHqsZ9C7HfC65EUBQC`
        },
        {
            _type: "revoke",
            message: `Revoke Freeze Authority: https://solscan.io/tx/6hQ9aha9jUajsu6wiu4dLNMPrKQJNYUpzASCfGeDEDV8eBHkH5EocnQWpdSGYRqbke7CaUZ17SRcgRkigG6NDvc\n\nRevoke Mint Authority: https://solscan.io/tx/yzZmiL8cnuJdsLB3Js17vE6YL9XMRhbTxbAGNv9Mh7ANzWQniX88Pmc4EhG4r6Bbh46chSrvo2yXghmhpdEBT4R`
        },
        {
            _type: "burn",
            message: `Burn: https://solscan.io/tx/2mbsjrCn5TZR4nbvWECiZY5sC6VprAga5ZyKKFN3zkrdr9LKHGDapyLJD6AtpFsvkDhw43oKNoFxjKzNMHvNtMX2`
        },
        {
            _type: "lock",
            message: `Lock: Soon`
        },
        {
            _type: "help",
            message: `Help Commands`
        },
        {
            _type: "tax",
            message: `Buy: 0% \nSell: 0%`
        },
        {
            _type: "website",
            message: `https://www.solanai.net?tg`
        },
        {
            _type: "whitepaper",
            message: `https://solanai.gitbook.io/`
        },
        {
            _type: "slippage",
            message: `0%`
        },
        {
            _type: "twitter",
            message: `https://twitter.com/SolanAI_X`
        },
        {
            _type: "x",
            message: `https://twitter.com/SolanAI_X`
        },
        {
            _type: "team",
            message: `https://www.solanai.net/#team`
        },
        {
            _type: "roadmap",
            message: `https://www.solanai.net/#roadmap`
        },
    ],
    capitalizeFirstChar(string) {
        if (string && string.length > 0) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        return string;
    },
    captionShort(caption) {
        if (caption.length > 500) {
            return caption.substring(0, 500 - 3) + "...";
        }
        return caption;
    },
    shortContract(payload) {
        if (payload && payload.length > 10) {
            return `${payload.substring(0, 5)}...${payload.substring(
                payload.length - 3
            )}`;
        }
        return payload;
    },
    priceCheck(payload) {
        const payloadType = typeof (payload);
        if (payload === 0 || payload == undefined) {
            return `⚪ 0`;
        } else if (payload > 0) {
            return `🟢 ${payload}%`;
        } else if (payload < 0) {
            return `🔴 ${payload}%`;
        }
    },
    staticText: {
        startContent: "Hey, I am an AI bot. You can ask with me directly. If you want to use more, please join the chat group.",
        longContent: "Long reply.",
        waitText: "Please wait.",
        welcomeText: "Welcome to the SolanAI!",
        // welcomeText: "Welcome to the SolanAI! You can use ai with these commands.\n🔽🔽\n\n/chat /image /portrait /realistic /music /video /gif /3d",
        errorText: `Error, please try again.`,
        errorMinLength: `Please try to run it with at least 3 characters!`,
        moreJoinText: `Please remember, join the telegram group to use all the features of AI. @Solan_ai`,
        tryCommand: ``,
        personalCommand: `For these commands, please join the chat group or visit our website!`,
        welcomeMessage: (username, surname) => {
            return `Hi ${username === undefined ? surname : `@${username}`} ✋!\n\n${botCore.staticText.welcomeText}`;
        },
        waitingMessage: (second) => {
            return `Please wait.\n\nIt will be completed in an average of ${second} seconds.`
        },
    },
};
const bot = new TelegramBot(botCore.telegramAPI, { polling: true });

const telegramOBJ = {
    price: {
        init: async (messageOBJ) => {
            const response = await axios.post(`${botCore.backendURL}/price`);
            const responseData = {
                sol: response.data.sol,
            };
            const priceMessage = `
            <blockquote>🟣🟣 Solana - <i>$${responseData.sol.priceUSD}</i></blockquote>
            <i>5 Minutes</i>: ${botCore.priceCheck(responseData.sol.priceChange.m5)} - <i>1 Hours</i>: ${botCore.priceCheck(responseData.sol.priceChange.h1)}

            <strong><code>Total Buy (24 Hours)</code></strong>: ${responseData.sol.lastTrade.h24.buys}
            <strong><code>Volume</code></strong>: <i>5 Minutes</i> ${botCore.priceCheck(responseData.sol.volume.m5)} - <i>1 Hours</i> ${botCore.priceCheck(responseData.sol.volume.h1)} - <i>24 Hours</i> ${botCore.priceCheck(responseData.sol.volume.h24)}
            <strong><code>Liquidity Pool</code></strong>: $${responseData.sol.liquidity.usd}
            
            `;
            
            const formattedPriceMessage = priceMessage
                .split('\n')
                .map(line => line.trim())
                .join('\n');


            bot.sendMessage(messageOBJ.chatID, formattedPriceMessage, {
                reply_to_message_id: messageOBJ.messageID,
                parse_mode: 'HTML'
            });
        },
    },
    chat: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(5)
                , {
                    reply_to_message_id: messageOBJ.messageID,
                });
            const sendPostData = {
                prompt: botCore.getMessage(messageOBJ.messageText),
                reqType: "telegram",
                userID: messageOBJ.userName === undefined ? `${messageOBJ.name} ${messageOBJ.lastName}` : messageOBJ.userName,
            };
            const response = await axios.post(`${botCore.backendURL}/chat`, sendPostData);
            const responseData = {
                answer: response.data.answer,
                question: response.data.question,
                language: response.data.language,
            };
            const chatCallBackData = responseData.question;
            const encodedCallbackData = encodeURIComponent(chatCallBackData);
            const bufferByte = Buffer.byteLength(encodedCallbackData, 'utf8');
            console.log("callbackData length (bytes):", bufferByte);
            if (bufferByte > 63) {
                bot.sendMessage(messageOBJ.chatID, botCore.staticText.longContent
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
            } else {
                bot.sendMessage(messageOBJ.chatID, `✅ ${botCore.captionShort(responseData.answer)}\n______________\nQuestion: ${responseData.question}\nLanguage: ${responseData.language.name}\nUser: @${sendPostData.userID}`
                , {
                    reply_to_message_id: messageOBJ.messageID,
                    reply_markup: {
                        inline_keyboard: [
                            [

                                {
                                    text: '🔃 Try Again',
                                    callback_data: encodedCallbackData,
                                    // JSON.stringify({ command: command, prompt: `/${command} ${responseData.question}` })
                                },
                            ],
                        ]
                    }
                });
            };
        },
    },
    portrait: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(5)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "portrait",
                "portrait-status",
                bot.sendPhoto.bind(bot),
                messageOBJ
            );
        },
    },
    person: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitText
                , {
                    reply_to_message_id: messageOBJ.messageID,
                });
            const sendPostData = {
                prompt: messageOBJ.messageText,
                reqType: "telegram",
                userID: messageOBJ.userName === undefined ? `${messageOBJ.name} ${messageOBJ.lastName}` : messageOBJ.userName,
            };
            const response = await axios.post(`${botCore.backendURL}/person`, sendPostData);
            const responseData = {
                answer: response.data.answer,
                question: response.data.question,
                language: response.data.language,
            };
            const chatCallBackData = responseData.question;
            const encodedCallbackData = encodeURIComponent(chatCallBackData);
            const bufferByte = Buffer.byteLength(encodedCallbackData, 'utf8');
            console.log("callbackData length (bytes):", bufferByte);
            if (bufferByte > 63) {
                bot.sendMessage(messageOBJ.chatID, botCore.staticText.longContent
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
            } else {
                bot.sendMessage(messageOBJ.chatID, `✅ ${botCore.captionShort(responseData.answer)}\n______________\nQuestion: ${responseData.question}\nLanguage: ${responseData.language.name}\nUser: @${sendPostData.userID}\n\n\n${botCore.staticText.moreJoinText}`
                , {
                    reply_to_message_id: messageOBJ.messageID,
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: 'More prompts: @Solan_ai',
                                    url: `https://t.me/Solan_ai`
                                },
                            ],
                            [
                                {
                                    text: 'Website',
                                    url: `https://www.solanai.net/`
                                },
                            ],
                        ]
                    }
                });
            };
        },
    },
    assistant: {
        init: async (messageOBJ, command) => {
            const sendPostData = {
                prompt: messageOBJ.messageText,
                reqType: "telegram",
                userID: messageOBJ.userName === undefined ? `${messageOBJ.name} ${messageOBJ.lastName}` : messageOBJ.userName,
            };
            const response = await axios.post(`${botCore.backendURL}/assistant`, sendPostData);
            const responseData = {
                answer: response.data.answer,
                question: response.data.question,
                language: response.data.language,
            };
            const chatCallBackData = responseData.question;
            const encodedCallbackData = encodeURIComponent(chatCallBackData);
            const bufferByte = Buffer.byteLength(encodedCallbackData, 'utf8');
            console.log("callbackData length (bytes):", bufferByte);
            if (bufferByte > 63) {
                bot.sendMessage(messageOBJ.chatID, botCore.staticText.longContent
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
            } else {
                bot.sendMessage(messageOBJ.chatID, `${responseData.answer}\n\n${botCore.staticText.tryCommand}`
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
            };
        },
    },
    image: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(10)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "image",
                "image-status",
                bot.sendPhoto.bind(bot),
                messageOBJ
            );
        },
    },
    realistic: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(100)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "realistic-image",
                "realistic-image-status",
                bot.sendPhoto.bind(bot),
                messageOBJ
            );
        },
    },
    video: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(80)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "video",
                "video-status",
                bot.sendVideo.bind(bot),
                messageOBJ
            );
        },
    },
    three: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(80)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "three",
                "three-status",
                bot.sendVideo.bind(bot),
                messageOBJ
            );
        },
    },
    gif: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(40)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "gif",
                "gif-status",
                bot.sendVideo.bind(bot),
                messageOBJ
            );
        },
    },
    music: {
        init: async (messageOBJ, command) => {
            bot.sendMessage(messageOBJ.chatID, botCore.staticText.waitingMessage(60)
            , {
                reply_to_message_id: messageOBJ.messageID,
            });
            await telegramOBJ.processMedia(
                command,
                "music",
                "music-status",
                bot.sendAudio.bind(bot),
                messageOBJ
            );
        },
    },
    processMedia: async (command, endpoint, statusEndpoint, sendFunction, messageOBJ) => {
        const mediaData = {
            prompt: botCore.getMessage(messageOBJ.messageText),
        };
        const mediaResponse = await axios.post(`${botCore.backendURL}/${endpoint}`, mediaData);
        const mediaResponseData = {
            prompt: mediaResponse.data.prompt,
            status: mediaResponse.data.status,
            error: mediaResponse.data.error,
            responseID: mediaResponse.data.responseID,
        };

        const checkMediaStatus = async () => {
            const mediaStatusData = {
                promptID: mediaResponseData.responseID,
                reqType: "telegram",
                userID: messageOBJ.userName === undefined ? `${messageOBJ.name} ${messageOBJ.lastName}` : messageOBJ.userName,
            };
            const mediaStatusResponse = await axios.post(
                `${botCore.backendURL}/${statusEndpoint}`,
                mediaStatusData
            );
            const mediaStatusResponseData = {
                prompt: mediaStatusResponse.data.prompt,
                status: mediaStatusResponse.data.status,
                error: mediaStatusResponse.data.error,
                responseID: mediaStatusResponse.data.responseID,
                render: mediaStatusResponse.data.render,
                logs: mediaStatusResponse.data.logs,
                promptDate: mediaStatusResponse.data.promptDate,
                mediaPath: mediaStatusResponse.data.output,
                mediaType: command,
            };

            if (
                mediaStatusResponseData.status === "starting" ||
                mediaStatusResponseData.status === "processing"
            ) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                await checkMediaStatus();
            } else if (mediaStatusResponseData.status === "failed") {
                bot.sendMessage(messageOBJ.chatID, botCore.staticText.errorText
                , {
                    reply_to_message_id: messageOBJ.messageID,
                });
            } else {
                const callbackData = JSON.stringify({ command: command, prompt: `/${command} ${mediaStatusResponseData.prompt.slice(0, 64)}` });
                const bufferByte = Buffer.byteLength(callbackData, 'utf8');
                console.log("Callback Data Length (bytes):", bufferByte);
                if (bufferByte > 63) {
                    sendFunction(messageOBJ.chatID, mediaStatusResponseData.mediaPath, {
                        caption: `✅ ${mediaStatusResponseData.prompt}\n______________\nStatus: Success\nRender: ${mediaStatusResponseData.render} Seconds\nUser:${mediaStatusData.userID}\nType: ${mediaStatusResponseData.mediaType}`,
                        reply_to_message_id: messageOBJ.messageID
                    });
                } else {
                    sendFunction(messageOBJ.chatID, mediaStatusResponseData.mediaPath, {
                        caption: `✅ ${mediaStatusResponseData.prompt}\n______________\nStatus: Success\nRender: ${mediaStatusResponseData.render} Seconds\nUser:${mediaStatusData.userID}\nType: ${mediaStatusResponseData.mediaType}`,
                        reply_to_message_id: messageOBJ.messageID,
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '🔃 Try Again',
                                        callback_data: callbackData
                                    },
                                ],
                            ]
                        }
                    });
                }


            }
        };
        await checkMediaStatus();

    },
};

bot.on('message', async (msg) => {
    let messageOBJ = {
        messageID: msg.message_id,
        chatID: msg.chat.id,
        userType: msg.chat.type,
        userName: msg.from.username,
        name: msg.from.first_name,
        lastName: msg.from.last_name,
        messageText: msg.text,
    };
    console.log(messageOBJ)
    // all text message
    if (typeof (messageOBJ.messageText) != "undefined") {
        // telegram group message
        if (messageOBJ.messageText.indexOf("/") != -1 && messageOBJ.chatID == botCore.telegramChatID) {
            // telegram dynamic commands
            if (botCore.getMessage(messageOBJ.messageText) != "") {
                const command = messageOBJ.messageText.trim().split(" ")[0].split("/")[1];
                try {
                    const commandArgs = botCore.getMessage(messageOBJ.messageText);
                    if (command === "chat" || command === "image" || command === "gif" || command === "music" || command === "video" || command === "3d" || command === "portrait" || command === "realistic") {
                        if (commandArgs.length < 4) {
                            bot.sendMessage(messageOBJ.chatID, botCore.staticText.errorMinLength
                            , {
                                reply_to_message_id: messageOBJ.messageID,
                            });
                            return;
                        }
                    };
                    if (command === "chat") {
                        telegramOBJ.chat.init(messageOBJ, command);
                    } else if (command === "image") {
                        telegramOBJ.image.init(messageOBJ, command);
                    } else if (command === "realistic") {
                        telegramOBJ.realistic.init(messageOBJ, command);
                    } else if (command === "portrait") {
                        telegramOBJ.portrait.init(messageOBJ, command);
                    } else if (command === "music") {
                        telegramOBJ.music.init(messageOBJ, command);
                    } else if (command === "video") {
                        telegramOBJ.video.init(messageOBJ, command);
                    } else if (command === "3d") {
                        telegramOBJ.three.init(messageOBJ, command);
                    } else if (command === "gif") {
                        telegramOBJ.gif.init(messageOBJ, command);
                    }
                } catch (error) {
                    console.error(error, error.response);
                    bot.sendMessage(messageOBJ.chatID, botCore.staticText.errorMinLength
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
                }
            } else {
                // telegram static commands
                const command = messageOBJ.messageText.trim().split(" ")[0].split("/")[1];
                searchCommand = messageOBJ.messageText.split("/")[1];
                if (searchCommand == "price") {
                    telegramOBJ.price.init(messageOBJ, command);
                    return false
                };
                for (let i = 0; i < botCore.tokenCommands.length; i++) {
                    const activeCommand = botCore.tokenCommands[i];
                    if (botCore.tokenCommands[i]._type == searchCommand) {
                        bot.sendMessage(messageOBJ.chatID, botCore.tokenCommands[i].message, {
                            reply_to_message_id: messageOBJ.messageID,
                        });
                        return false
                    }
                }
                if (searchCommand === "filters") {
                    let allFilters = "";
                    for (let i = 0; i < botCore.tokenCommands.length; i++) {
                        allFilters += `${i + 1}-) /${botCore.tokenCommands[i]._type}\n`;
                    }
                    bot.sendMessage(messageOBJ.chatID, allFilters, {
                        reply_to_message_id: messageOBJ.messageID,
                    });
                    return false;
                }

                const commandArgs = botCore.getMessage(messageOBJ.messageText);
                console.log("length control", commandArgs)
                if (command === "chat" || command === "image" || command === "gif" || command === "portrait" || command === "music" || command === "video" ||  command === "3d" || command === "realistic") {
                    if (commandArgs.length < 4) {
                        bot.sendMessage(messageOBJ.chatID, botCore.staticText.errorMinLength
                        , {
                            reply_to_message_id: messageOBJ.messageID,
                        });
                        return;
                    }
                }
            }
        } else {
            // person chat
            if (messageOBJ.chatID != botCore.telegramChatID) {
                // bot.sendMessage(messageOBJ.chatID, "Please join our channel to use this bot. @Solan_ai", {
                //     reply_to_message_id: messageOBJ.messageID,
                // });
                try {
                    const command = messageOBJ.messageText.trim().split(" ")[0].split("/")[1];
                    if (command === "chat" || command === "image" || command === "gif" || command === "portrait"|| command === "music" || command === "video" ||  command === "3d" || command === "realistic" || command === "contract" || command === "website" || command === "ca") {
                        bot.sendMessage(messageOBJ.chatID, botCore.staticText.personalCommand
                            , {
                                reply_to_message_id: messageOBJ.messageID,
                                reply_markup: {
                                    inline_keyboard: [
                                        [
                                            {
                                                text: 'More prompts: @Solan_ai',
                                                url: `https://t.me/Solan_ai`
                                            },
                                        ],
                                        [
                                            {
                                                text: 'Website',
                                                url: `https://www.solanai.net/`
                                            },
                                        ],
                                    ]
                                }
                            });
                    } else if (command === "price") {
                        telegramOBJ.price.init(messageOBJ, "/price");
                    } else if (command === "start" || command === "help") {
                        let allFilters = "";
                        for (let i = 0; i < botCore.tokenCommands.length; i++) {
                            allFilters += `${i + 1}-) /${botCore.tokenCommands[i]._type}\n`;
                        }
                        bot.sendMessage(messageOBJ.chatID, `${botCore.staticText.startContent}\n\n${allFilters}\n${botCore.staticText.moreJoinText}`, {
                            reply_to_message_id: messageOBJ.messageID,
                        });
                        return false;
                    }
                    else {
                        // single chat
                        telegramOBJ.person.init(messageOBJ, "/person");
                    }
                } catch (error) {
                    console.error(error, error.response);
                    bot.sendMessage(messageOBJ.chatID, botCore.staticText.errorText
                    , {
                        reply_to_message_id: messageOBJ.messageID,
                    });
                }
            }
        };
        // telegram token group single chat
        if (messageOBJ.messageText.indexOf("/") == -1 && messageOBJ.chatID == botCore.telegramChatID) {
            if (messageOBJ.messageText.length > 3) {
                try {
                    // telegramOBJ.assistant.init(messageOBJ, "/assistant");
                } catch (error) {
                    console.error(error, error.response);
                }
            }
        };
    };

    // welcome message
    if (msg.new_chat_members && msg.new_chat_members.length > 0) {
        for (const member of msg.new_chat_members) {
            const userId = member.id;
            const userName = member.username;
            const chatId = msg.chat.id;
            const welcomeMessage = botCore.staticText.welcomeMessage(userName, member.first_name);
            bot.sendMessage(chatId, welcomeMessage);
        }
    };
});
bot.on('callback_query', async (callbackQuery) => {
    const message = callbackQuery.message;
    const callbackData = callbackQuery.data;

    let command, prompt;
    try {
        const parsedData = JSON.parse(callbackData);
        command = parsedData.command;
        prompt = parsedData.prompt;
    } catch (error) {
        command = 'chat';
        prompt = `/${command} ${decodeURIComponent(callbackData)}`;
        console.log("catch block", callbackData)
    }

    let messageOBJ = {
        messageID: message.message_id,
        chatID: message.chat.id,
        userType: message.chat.type,
        userName: message.from.username,
        name: message.from.first_name,
        lastName: message.from.last_name,
        messageText: prompt
    };

    if (command === 'chat') {
        telegramOBJ.chat.init(messageOBJ, command);
    } else if (command === 'image') {
        telegramOBJ.image.init(messageOBJ, command);
    } else if (command === 'portrait') {
        telegramOBJ.portrait.init(messageOBJ, command);
    } else if (command === 'music') {
        telegramOBJ.music.init(messageOBJ, command);
    } else if (command === 'video') {
        telegramOBJ.video.init(messageOBJ, command);
    } else if (command === '3d') {
        telegramOBJ.three.init(messageOBJ, command);
    } else if (command === 'realistic') {
        telegramOBJ.realistic.init(messageOBJ, command);
    } else if (command === 'video') {
        telegramOBJ.video.init(messageOBJ, command);
    } else if (command === 'music') {
        telegramOBJ.music.init(messageOBJ, command);
    } else if (command === 'gif') {
        telegramOBJ.gif.init(messageOBJ, command);
    }
});
