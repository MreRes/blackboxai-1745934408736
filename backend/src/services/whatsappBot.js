const { NlpManager } = require('node-nlp');
const { Transaction, User, Budget, FinancialGoal } = require('../models');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

class WhatsAppBot {
    constructor() {
        this.nlp = new NlpManager({ languages: ['id', 'en'] });
        this.speechClient = new speech.SpeechClient();
        this.initializeNLP();
    }

    async initializeNLP() {
        // Add financial transaction intents in Indonesian
        this.nlp.addDocument('id', 'catat pengeluaran {amount} untuk {category}', 'transaction.expense');
        this.nlp.addDocument('id', 'saya menghabiskan {amount} untuk {category}', 'transaction.expense');
        this.nlp.addDocument('id', 'bayar {amount} untuk {category}', 'transaction.expense');
        this.nlp.addDocument('id', 'keluarkan {amount} untuk {category}', 'transaction.expense');
        this.nlp.addDocument('id', 'pengeluaran {amount} untuk {category}', 'transaction.expense');
        this.nlp.addDocument('id', 'biaya {amount} untuk {category}', 'transaction.expense');
        
        this.nlp.addDocument('id', 'catat pemasukan {amount} dari {category}', 'transaction.income');
        this.nlp.addDocument('id', 'terima {amount} dari {category}', 'transaction.income');
        this.nlp.addDocument('id', 'dapat {amount} dari {category}', 'transaction.income');
        this.nlp.addDocument('id', 'masuk {amount} dari {category}', 'transaction.income');
        this.nlp.addDocument('id', 'pemasukan {amount} dari {category}', 'transaction.income');
        this.nlp.addDocument('id', 'pendapatan {amount} dari {category}', 'transaction.income');

        // Add budget queries in Indonesian
        this.nlp.addDocument('id', 'berapa sisa budget {category}?', 'budget.check');
        this.nlp.addDocument('id', 'cek budget {category}', 'budget.check');
        this.nlp.addDocument('id', 'lihat budget {category}', 'budget.check');

        // Add financial goal queries in Indonesian
        this.nlp.addDocument('id', 'progress target {goalName}', 'goal.check');
        this.nlp.addDocument('id', 'cek target {goalName}', 'goal.check');
        this.nlp.addDocument('id', 'berapa persen target {goalName}', 'goal.check');

        // Add help commands in Indonesian
        this.nlp.addDocument('id', 'bantuan', 'help');
        this.nlp.addDocument('id', 'cara pakai', 'help');
        this.nlp.addDocument('id', 'menu', 'help');

        // Add financial transaction intents in English
        this.nlp.addDocument('en', 'record expense {amount} for {category}', 'transaction.expense');
        this.nlp.addDocument('en', 'I spent {amount} on {category}', 'transaction.expense');
        this.nlp.addDocument('en', 'pay {amount} for {category}', 'transaction.expense');

        this.nlp.addDocument('en', 'record income {amount} from {category}', 'transaction.income');
        this.nlp.addDocument('en', 'received {amount} from {category}', 'transaction.income');
        this.nlp.addDocument('en', 'got {amount} from {category}', 'transaction.income');

        // Add budget queries in English
        this.nlp.addDocument('en', 'how much budget left for {category}?', 'budget.check');
        this.nlp.addDocument('en', 'check budget {category}', 'budget.check');
        this.nlp.addDocument('en', 'show budget {category}', 'budget.check');

        // Add financial goal queries in English
        this.nlp.addDocument('en', 'progress of goal {goalName}', 'goal.check');
        this.nlp.addDocument('en', 'check goal {goalName}', 'goal.check');
        this.nlp.addDocument('en', 'what percent of goal {goalName}', 'goal.check');

        // Add help commands in English
        this.nlp.addDocument('en', 'help', 'help');
        this.nlp.addDocument('en', 'how to use', 'help');
        this.nlp.addDocument('en', 'menu', 'help');

        // Train NLP model
        await this.nlp.train();
        console.log('NLP model trained successfully');
    }

    async transcribeAudio(audioBuffer) {
        const audioBytes = audioBuffer.toString('base64');

        const request = {
            audio: {
                content: audioBytes,
            },
            config: {
                encoding: 'OGG_OPUS',
                sampleRateHertz: 48000,
                languageCode: 'id-ID',
            },
        };

        const [response] = await this.speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');
        return transcription;
    }

    async processMessage(message, from, isVoice = false, audioBuffer = null) {
        try {
            // Find user by WhatsApp number
            const user = await User.findOne({
                where: { whatsappNumber: from }
            });

            if (!user) {
                return 'Maaf, nomor WhatsApp Anda belum terdaftar. Silakan daftar melalui website kami terlebih dahulu.';
            }

            let textMessage = message;

            if (isVoice && audioBuffer) {
                textMessage = await this.transcribeAudio(audioBuffer);
                console.log(`Transcribed voice message: ${textMessage}`);
            }

            // Detect language automatically
            const language = this.nlp.guessLanguage(textMessage)[0]?.alpha2 || 'id';

            // Process message with NLP
            const result = await this.nlp.process(language, textMessage);

            // Handle different intents
            switch (result.intent) {
                case 'transaction.expense':
                    return await this.handleExpense(result, user);
                case 'transaction.income':
                    return await this.handleIncome(result, user);
                case 'budget.check':
                    return await this.checkBudget(result, user);
                case 'goal.check':
                    return await this.checkGoal(result, user);
                case 'help':
                    return this.getHelpMessage();
                default:
                    return 'Maaf, saya tidak mengerti perintah tersebut. Ketik "bantuan" untuk melihat panduan penggunaan.';
            }
        } catch (error) {
            console.error('Error processing message:', error);
            return 'Maaf, terjadi kesalahan dalam memproses pesan Anda. Silakan coba lagi nanti.';
        }
    }

    async handleExpense(result, user) {
        try {
            const amount = this.extractAmount(result);
            const category = this.extractCategory(result);

            if (!amount || !category) {
                return 'Format tidak valid. Contoh: "catat pengeluaran 50000 untuk makan"';
            }

            // Create transaction
            await Transaction.create({
                userId: user.id,
                type: 'EXPENSE',
                amount: amount,
                category: category,
                description: result.utterance,
                date: new Date()
            });

            // Update budget if exists
            const budget = await Budget.findOne({
                where: {
                    userId: user.id,
                    categories: {
                        [Op.contains]: [category]
                    },
                    status: 'ACTIVE'
                }
            });

            if (budget) {
                budget.currentSpending = parseFloat(budget.currentSpending) + amount;
                await budget.save();
            }

            return `✅ Pengeluaran sebesar Rp${amount.toLocaleString('id-ID')} untuk ${category} berhasil dicatat.`;
        } catch (error) {
            console.error('Error handling expense:', error);
            return 'Maaf, terjadi kesalahan dalam mencatat pengeluaran. Silakan coba lagi.';
        }
    }

    async handleIncome(result, user) {
        try {
            const amount = this.extractAmount(result);
            const category = this.extractCategory(result);

            if (!amount || !category) {
                return 'Format tidak valid. Contoh: "catat pemasukan 1000000 dari gaji"';
            }

            // Create transaction
            await Transaction.create({
                userId: user.id,
                type: 'INCOME',
                amount: amount,
                category: category,
                description: result.utterance,
                date: new Date()
            });

            return `✅ Pemasukan sebesar Rp${amount.toLocaleString('id-ID')} dari ${category} berhasil dicatat.`;
        } catch (error) {
            console.error('Error handling income:', error);
            return 'Maaf, terjadi kesalahan dalam mencatat pemasukan. Silakan coba lagi.';
        }
    }

    async checkBudget(result, user) {
        try {
            const category = this.extractCategory(result);
            
            if (!category) {
                return 'Format tidak valid. Contoh: "cek budget makan"';
            }

            const budget = await Budget.findOne({
                where: {
                    userId: user.id,
                    categories: {
                        [Op.contains]: [category]
                    },
                    status: 'ACTIVE'
                }
            });

            if (!budget) {
                return `Tidak ada budget yang diatur untuk kategori ${category}.`;
            }

            const remaining = budget.getRemainingAmount();
            const percentage = budget.getSpendingPercentage();

            return `💰 Budget ${category}:\n` +
                   `Total: Rp${budget.amount.toLocaleString('id-ID')}\n` +
                   `Terpakai: Rp${budget.currentSpending.toLocaleString('id-ID')} (${percentage.toFixed(1)}%)\n` +
                   `Sisa: Rp${remaining.toLocaleString('id-ID')}`;
        } catch (error) {
            console.error('Error checking budget:', error);
            return 'Maaf, terjadi kesalahan dalam mengecek budget. Silakan coba lagi.';
        }
    }

    async checkGoal(result, user) {
        try {
            const goalName = result.entities.find(e => e.entity === 'goalName')?.value;
            
            if (!goalName) {
                return 'Format tidak valid. Contoh: "cek target tabungan rumah"';
            }

            const goal = await FinancialGoal.findOne({
                where: {
                    userId: user.id,
                    name: {
                        [Op.iLike]: `%${goalName}%`
                    },
                    status: 'ACTIVE'
                }
            });

            if (!goal) {
                return `Target keuangan "${goalName}" tidak ditemukan.`;
            }

            const progress = goal.getProgress();
            const remaining = goal.getRemainingAmount();
            const daysLeft = goal.getDaysRemaining();

            return `🎯 Target: ${goal.name}\n` +
                   `Progress: ${progress.toFixed(1)}%\n` +
                   `Terkumpul: Rp${goal.currentAmount.toLocaleString('id-ID')}\n` +
                   `Target: Rp${goal.targetAmount.toLocaleString('id-ID')}\n` +
                   `Sisa: Rp${remaining.toLocaleString('id-ID')}\n` +
                   `Waktu tersisa: ${daysLeft} hari`;
        } catch (error) {
            console.error('Error checking goal:', error);
            return 'Maaf, terjadi kesalahan dalam mengecek target. Silakan coba lagi.';
        }
    }

    getHelpMessage() {
        return `🤖 *Panduan Penggunaan Bot Keuangan*\n\n` +
               `1. Catat Pengeluaran:\n` +
               `   "catat pengeluaran [jumlah] untuk [kategori]"\n` +
               `   Contoh: "catat pengeluaran 50000 untuk makan"\n\n` +
               `2. Catat Pemasukan:\n` +
               `   "catat pemasukan [jumlah] dari [kategori]"\n` +
               `   Contoh: "catat pemasukan 1000000 dari gaji"\n\n` +
               `3. Cek Budget:\n` +
               `   "cek budget [kategori]"\n` +
               `   Contoh: "cek budget makan"\n\n` +
               `4. Cek Target:\n` +
               `   "cek target [nama target]"\n` +
               `   Contoh: "cek target tabungan rumah"`;
    }

    extractAmount(result) {
        const amountEntity = result.entities.find(e => e.entity === 'amount');
        if (!amountEntity) return null;
        
        // Convert string amount to number
        const amount = parseFloat(amountEntity.value.replace(/[^0-9]/g, ''));
        return isNaN(amount) ? null : amount;
    }

    extractCategory(result) {
        const categoryEntity = result.entities.find(e => e.entity === 'category');
        return categoryEntity ? categoryEntity.value.toLowerCase() : null;
    }
}

module.exports = new WhatsAppBot();
