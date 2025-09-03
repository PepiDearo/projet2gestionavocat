
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('./database/knex');
const cookieParser = require('cookie-parser');
const { type } = require('os');


const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database('./logs.sql', (err) => {
//     if (err) {
//         console.error("Erreur d'ouverture de la base de données:", err.message);
//     } else {
//         console.log("Connexion à la base de données SQLite réussie !");
//     }
// });










const app = express();
const port = 3000;


const uploadFolder = 'uploads';
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const originalName = file.originalname;
        const timestamp = Date.now();
        const extname = path.extname(originalName);
        const baseName = path.basename(originalName, extname);

        const newFileName = `${baseName}_${timestamp}${extname}`;

        cb(null, newFileName);
    }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, uploadFolder)))
app.use(express.json());
app.use(cookieParser());

function verifierAdmin(req, res, next) {
    const cookie = req.cookies.session;

    if (!cookie) {
        return res.status(401).json({ message: 'Non autorisé, aucun cookie de session' });
    }

    try {
        const sessionData = JSON.parse(cookie);
        // console.log(sessionData.isAdmin)
        if (sessionData.isAdmin === 1) {
            return next();
        } else if (sessionData.isAdmin !== 1) {
            return res.status(403).json({ message: 'Accès refusé, utilisateur non admin' });
        }
    } catch (err) {
        console.error('Erreur lors de la vérification du statut admin :', err.message);
        return res.status(401).json({ message: 'Session invalide' });
    }
}


app.get('/main', (req, res) => {
    const sessionCookie = req.cookies.session;
    // console.log(req.cookies)
    if (!sessionCookie) {
        return res.sendStatus(401); // Unauthorized si pas de cookie session
    }
    res.sendFile(__dirname + '/public/main/main.html');
});

app.get('/connexion', (req, res) => {
    res.clearCookie('session');
    res.sendFile(__dirname + '/public/connexion/connexion.html');
});

app.get('/inscription', (req, res) => {
    res.clearCookie('session');
    res.sendFile(__dirname + '/public/inscription/inscription.html');
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/acceuil/acceuil.html');
});

app.get('/documents', (req, res) => {
    res.sendFile(__dirname + '/public/documents/gestiondocuments.html');

});


app.get('/utilisateurs', (req, res) => {
    res.sendFile(__dirname + '/public/admin-utilisateurs/utilisateurs.html');

});

app.get('/reporting', (req, res) => {
    res.sendFile(__dirname + '/public/reporting/reporting.html');
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const sessionData = JSON.parse(sessionCookie);
        const email = sessionData.adresseCourriel;

        if (!req.file) {
            return res.status(400).send('Aucun fichier reçu.');
        }

        const nomFichier = req.file.originalname;
        const dateUpload = new Date().toISOString();

        // Insertion dans la table Documents avec le nom du fichier renommer
        await db('Documents').insert({
            user: email,
            nom: req.file.filename,  // Enregistrement du fichier avec le timestamp ajouté
            date: dateUpload
        });

        res.json({
            message: 'Fichier téléversé et enregistré avec succès.',
            file: {
                originalname: nomFichier,
                size: req.file.size,
                path: req.file.path,
                mimeType: req.file.mimetype
            }
        });
    } catch (error) {
        console.error("Erreur lors de l'upload ou de l'insertion :", error);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
});


app.get('/files', async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const sessionData = JSON.parse(sessionCookie);
        const email = sessionData.adresseCourriel;

        const documents = await db('Documents')
            .where({ user: email })
            .orderBy('date', 'desc');

        const fileDetails = documents.map(doc => {
            const filePath = path.join(uploadFolder, doc.nom);  // Utilisation du nom avec timestamp

            return {
                name: doc.nom,                          // nom avec timestamp
                path: `/uploads/${doc.nom}`,            // Utilisation du nom avec timestamp
                size: fs.statSync(filePath).size,
                date: doc.date                          // date exacte depuis la BDD
            };
        });

        res.json(fileDetails);
    } catch (err) {
        console.error('Erreur lors de la récupération des fichiers :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});



app.delete('/files/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadFolder, filename);  // Utilisation du nom avec timestamp

    try {
        // Vérifiez si le fichier existe avant de tenter de le supprimer
        const fileExists = await fs.promises.stat(filePath).catch(() => false);

        if (fileExists) {
            // Supprimez le fichier du système de fichiers
            await fs.promises.unlink(filePath);
        } else {
            console.log(`Fichier non trouvé dans le système de fichiers: ${filename}`);
        }

        // Supprimez l'enregistrement du fichier de la base de données
        const result = await db('Documents')
            .where({ nom: filename })
            .del();  // Supprime l'enregistrement dans la table Documents

        if (result === 0) {
            return res.status(404).json({ error: 'Fichier introuvable dans la base de données.' });
        }

        res.json({ message: 'Fichier et enregistrement dans la base de données supprimés avec succès.' });
    } catch (err) {
        console.error("Erreur lors de la suppression du fichier ou de la base de données:", err);
        res.status(500).json({ error: "Échec de la suppression du fichier et de l'enregistrement dans la base de données" });
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get('/communications', (req, res) => {
    res.sendFile(__dirname + '/public/communications/communications.html');
});

app.delete('/emails/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedRows = await db('Communications')
            .where({ idCommunication: id })
            .del();

        if (deletedRows > 0) {
            res.status(200).json({ message: 'email supprime avec succes' });
        } else {
            res.status(404).json({ message: 'email introuvable' });
        }
    } catch (error) {
        console.error('Erreur lors de la suppression de lemail :', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

app.get('/emails', async (req, res) => {
    const { q, page } = req.query;
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const sessionData = JSON.parse(sessionCookie);
        const email = sessionData.adresseCourriel;
        const offset = (page - 1) * 8;

        const communications = await db('Communications')
            .where({ destinataire: email })
            .andWhere(function () {
                this.where('message', 'like', `%${q}%`)
                    .orWhere('sujet', 'like', `%${q}%`)
                    .orWhere('user', 'like', `%${q}%`);
            })
            .orderBy('idCommunication', 'desc')
            .limit(8)
            .offset(offset);


        const totalcommu = await db('Communications')
            .where({ destinataire: email })
            .andWhere(function () {
                this.where('message', 'like', `%${q}%`)
                    .orWhere('sujet', 'like', `%${q}%`)
                    .orWhere('user', 'like', `%${q}%`);
            })
            .count('* as total');

        res.json({
            communications,
            totalPages: Math.ceil(totalcommu[0].total / 8)
        });
    } catch (err) {
        console.error('Erreur lors de la récupération des emails :', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST Factures
app.post("/api/factures", (req, res) => {
    console.log("Requête reçue sur /api/factures", req.body);

    const { idUser, montant, dateEmission, statut } = req.body;

    if (!idUser || !montant || !dateEmission || !statut) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    const checkUserQuery = `SELECT idUser FROM Utilisateurs WHERE idUser = ?`;
    db.get(checkUserQuery, [idUser], (err, row) => {
        if (err) {
            console.error("Erreur SQLite lors de la vérification de l'utilisateur:", err.message);
            return res.status(500).json({ error: "Erreur serveur lors de la vérification de l'utilisateur." });
        }

        if (!row) {
            return res.status(404).json({ error: "ID utilisateur inexistant." });
        }

        const insertQuery = `INSERT INTO Factures (idUser, montant, date_emission, statut) VALUES (?, ?, ?, ?)`;
        db.run(insertQuery, [idUser, montant, dateEmission, statut], function(err) {
            if (err) {
                console.error("Erreur SQLite lors de l'insertion:", err.message);
                return res.status(500).json({ error: "Erreur lors de la création de la facture." });
            }
            res.status(201).json({ id: this.lastID, message: "Facture créée avec succès !" });
        });
    });
});

// GET toutes les factures
app.get('/api/factures', (req, res) => {
    const query = `
        SELECT id, idUser, montant, 
               date_emission as dateEmission, statut 
        FROM Factures
        ORDER BY date_emission DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Erreur SQLite:", err);
            return res.status(500).json({ 
                error: "Erreur serveur",
                details: err.message 
            });
        }

        const factures = rows.map(row => ({
            ...row,
            montant: parseFloat(row.montant),
            dateEmission: row.dateEmission 
        }));

        res.json(factures);
    });
});

// DELETE une facture
app.delete('/api/factures/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM Factures WHERE id = ?', [id], function(err) {
        if (err) {
            console.error("Erreur SQLite:", err);
            return res.status(500).json({ 
                error: "Erreur lors de la suppression",
                details: err.message 
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Facture non trouvée" });
        }

        res.status(204).end();
    });
});

// PUT pour modifier une facture
app.put('/api/factures/:id', (req, res) => {
    const { id } = req.params;
    const { idUser, montant, dateEmission, statut } = req.body;

    if (!idUser || !montant || !dateEmission || !statut) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    const updateQuery = `
        UPDATE Factures 
        SET idUser = ?, montant = ?, date_emission = ?, statut = ?
        WHERE id = ?
    `;

    db.run(updateQuery, [idUser, montant, dateEmission, statut, id], function(err) {
        if (err) {
            console.error("Erreur SQLite:", err.message);
            return res.status(500).json({ error: "Erreur lors de la mise à jour de la facture." });
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Facture non trouvée" });
        }

        res.json({ 
            id: id,
            message: "Facture mise à jour avec succès !",
            changes: this.changes
        });
    });
});

app.post('/api/email', async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const sessionData = JSON.parse(sessionCookie);
        const email = sessionData.adresseCourriel;
        const { receveur, sujet, message } = req.body;

        const maxIdResult = await db('Communications')
            .max('idCommunication as maxId')
            .first();

        const newId = maxIdResult.maxId ? maxIdResult.maxId + 1 : 1;

        await db('Communications').insert({
            idCommunication: newId,
            user: email,
            destinataire: receveur,
            sujet: sujet,
            message: message,
            date: db.raw("datetime('now')"),
        });
        res.status(200).json({ message: 'envoi réussi' }); //200 pr reponse.ok
    }
    catch (err) {
        console.error('erreur lors de la tentative denvoi: ', err.message);
        res.status(500).send('erreur interne du serveur');
    };
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const utilisateur = await db('Utilisateurs')
            .where({ adresseCourriel: email, motDePasse: password })
            .first()

        if (utilisateur) {
            let role = null;
            if (utilisateur.isClient === 1) {
                role = 'Client';
            } else if (utilisateur.isAvocat === 1) {
                role = 'Avocat';
            }

            res.cookie(
                'session',
                JSON.stringify({ username: utilisateur.username, adresseCourriel: utilisateur.adresseCourriel, isAdmin: utilisateur.isAdmin, role: role }),
                {
                    maxAge: 24 * 60 * 60 * 1000

                });
            // console.log(adresseCourriel)
            res.status(200).json({ message: 'Connexion réussie' }); //200 pr reponse.ok
        }
        else {
            res.status(401).send('credentiels: invalides'); //login ratee
        }
    }
    catch (err) {
        console.error('erreur lors de la tentative de connexion: ', err.message);
        res.status(500).send('erreur interne du serveur');
    };
});

//logout
app.post('/api/logout', async (req, res) => {
    try {
        console.log('deconnexion demandee');

        const sessionCookie = req.cookies.session;
        // console.log(sessionCookie)
        if (!sessionCookie) {
            return res.status(400).json({ message: "erreur lors de la deconnexion" });
        }

        const cookiedata = JSON.parse(sessionCookie);
        const email = cookiedata.adresseCourriel
        // console.log(cookiedata.adresseCourriel)

        res.clearCookie('session'); // enlever le cookie

        res.status(200).json({ message: "logout reussie" }); // 200=logout reussi
    } catch (error) {
        console.error('Erreur pendant la deconnexion:', error);
        res.status(500).json({ message: "erreur serveur lors de la deconnexion" }); // 500=erreur serveur
    }
});

//logout

app.post('/api/logout', async (req, res) => {
    try {
        console.log("deconnexion demandee")
        res.clearCookie('session');
        req.logout(() => {
            res.status(200).json({ message: 'Déconnexion réussie' });
        });
    } catch (error) {
        console.error('Erreur pendant la déconnexion:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la déconnexion' });
    }
});


app.listen(port, () => {
    console.log(`le serveur est en cours d'execution sur http://localhost:${port}`);
});

//register
app.post('/api/register', async (req, res) => {
    const { email, utilisateur, password, isClient, isAvocat } = req.body;
    // console.log(req.body)
    try {
        await db('utilisateurs').insert({
            adresseCourriel: email,
            username: utilisateur,
            motDePasse: password,
            isClient: isClient,
            isAvocat: isAvocat
        });
        res.status(200).json({ message: 'Connexion réussie' }); //200 pr reponse.ok
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout de lutilisateur.", error: error.message });
    }
});

const cleanDatabase = async () => {
    const documents = await db('Documents');
    for (const doc of documents) {
        // Utiliser directement le nom du fichier tel qu'il est stocké dans la base de données
        const filePath = path.join(uploadFolder, doc.nom);

        if (!fs.existsSync(filePath)) {
            console.log(`Suppression de l'entrée orpheline : ${doc.nom}`);
            await db('Documents').where({ nom: doc.nom }).del();
        }
    }
};

app.get('/clean-database', verifierAdmin, async (req, res) => {
    try {
        await cleanDatabase(); // Appeler la fonction de nettoyage
        res.json({ message: 'Base de données nettoyée des fichiers manquants.' });
    } catch (err) {
        console.error('Erreur lors du nettoyage de la base de données :', err);
        res.status(500).json({ error: 'Erreur serveur lors du nettoyage.' });
    }
});

app.get('/statistics', (req, res) => {
    const sessionCookie = req.cookies.session;
    if (!sessionCookie) {
        return res.sendStatus(401);
    }
    res.sendFile(__dirname + '/public/statistics/statistics.html');
});


//get la bdd
app.get('/api/utilisateurs', verifierAdmin, async (req, res) => {
    try {
        const utilisateurs = await db('Utilisateurs').select('*').orderBy('idUser', 'desc');
        res.json(utilisateurs); 
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.', error: error.message });
    }
});

app.post('/api/utilisateurs', verifierAdmin, async (req, res) => {
    try {
        const sessionCookie = req.cookies.session;
        if (!sessionCookie) {
            return res.status(401).json({ error: 'Utilisateur non authentifié' });
        }

        const { adresseCourriel, username, motDePasse, isClient, isAvocat, isAdmin } = req.body;

        const maxIdResult = await db('Utilisateurs')
            .max('idUser as maxId')
            .first();

        const newId = maxIdResult.maxId ? maxIdResult.maxId + 1 : 1;

        await db('Utilisateurs').insert({
            adresseCourriel: adresseCourriel,
            username: username,
            motDePasse: motDePasse,
            isClient: isClient,
            isAvocat: isAvocat,
            isAdmin:isAdmin,
            idUser: newId,
        });
        res.status(200).json({ message: 'ajout réussi' }); //200 pr reponse.ok
    }
    catch (err) {
        console.error('erreur lors de la tentative denvoi: ', err.message);
        res.status(500).send('erreur interne du serveur');
    };
});

app.delete('/api/utilisateurs/:id', verifierAdmin, async (req, res) => {
    const idUser = req.params.id;
    try {
        await db('Utilisateurs').where({ idUser }).del();
        res.status(200).json({ message: 'ajout réussi' }); //200 pr reponse.ok
    }
    catch (err) {
        console.error('erreur lors de la tentative denvoi: ', err.message);
        res.status(500).send('erreur interne du serveur');
    };
});
app.put('/api/utilisateurs/:id', verifierAdmin, async (req, res) => {
    const { adresseCourriel, username, motDePasse, isClient, isAvocat, isAdmin } = req.body;
    const idUser = req.params.id; 

    try {
        const updated = await db('Utilisateurs')
            .where({ idUser })
            .update({
                adresseCourriel,
                username,
                motDePasse,
                isClient,
                isAvocat,
                isAdmin
            });

        if (updated === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.status(200).json({ message: 'Utilisateur modifié avec succès' });
    } catch (error) {
        console.error('Erreur modification utilisateur :', error.message);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

  
// get users recents
//get la bdd
app.get('/get-users', async (req, res) => {
    try {
        const utilisateurs = await db('Utilisateurs').select('*')
        .orderBy('idUser', 'desc')
        .limit(3)
        
        res.send(utilisateurs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.', error: error.message });
    }
})

app.get('/get-clients', async (req, res) => {
    try {
        const utilisateurs = await db('Utilisateurs').select('*')
        .where({isClient: 1})
        .orderBy('idUser', 'desc')
        .limit(3)
        
        res.send(utilisateurs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.', error: error.message });
    }
})

app.get('/get-avocats', async (req, res) => {
    try {
        const utilisateurs = await db('Utilisateurs').select('*')
        .where({isAvocat: 1})
        .orderBy('idUser', 'desc')
        .limit(3)
        
        res.send(utilisateurs)
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.', error: error.message });
    }
})




// clientID: '237947066250-f3c7dnfd7ckue5skbnt8894ee12c12mj.apps.googleusercontent.com',
// clientSecret: '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'
