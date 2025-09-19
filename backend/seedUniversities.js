// University seeding script
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');
const db = new Database(dbPath);

// Top global universities with their domains
const universities = [
  // United States
  { name: "Harvard University", country: "United States", domain: "harvard.edu" },
  { name: "Stanford University", country: "United States", domain: "stanford.edu" },
  { name: "Massachusetts Institute of Technology", country: "United States", domain: "mit.edu" },
  { name: "California Institute of Technology", country: "United States", domain: "caltech.edu" },
  { name: "University of California, Berkeley", country: "United States", domain: "berkeley.edu" },
  { name: "Princeton University", country: "United States", domain: "princeton.edu" },
  { name: "Yale University", country: "United States", domain: "yale.edu" },
  { name: "Columbia University", country: "United States", domain: "columbia.edu" },
  { name: "University of Chicago", country: "United States", domain: "uchicago.edu" },
  { name: "Cornell University", country: "United States", domain: "cornell.edu" },
  { name: "University of Pennsylvania", country: "United States", domain: "upenn.edu" },
  { name: "Johns Hopkins University", country: "United States", domain: "jhu.edu" },
  { name: "Northwestern University", country: "United States", domain: "northwestern.edu" },
  { name: "Duke University", country: "United States", domain: "duke.edu" },
  { name: "Washington University in St. Louis", country: "United States", domain: "wustl.edu" },
  { name: "Brown University", country: "United States", domain: "brown.edu" },
  { name: "Vanderbilt University", country: "United States", domain: "vanderbilt.edu" },
  { name: "Rice University", country: "United States", domain: "rice.edu" },
  { name: "University of Notre Dame", country: "United States", domain: "nd.edu" },
  { name: "Carnegie Mellon University", country: "United States", domain: "cmu.edu" },
  
  // United Kingdom
  { name: "University of Oxford", country: "United Kingdom", domain: "ox.ac.uk" },
  { name: "University of Cambridge", country: "United Kingdom", domain: "cam.ac.uk" },
  { name: "Imperial College London", country: "United Kingdom", domain: "imperial.ac.uk" },
  { name: "London School of Economics", country: "United Kingdom", domain: "lse.ac.uk" },
  { name: "University College London", country: "United Kingdom", domain: "ucl.ac.uk" },
  { name: "King's College London", country: "United Kingdom", domain: "kcl.ac.uk" },
  { name: "University of Edinburgh", country: "United Kingdom", domain: "ed.ac.uk" },
  { name: "University of Manchester", country: "United Kingdom", domain: "manchester.ac.uk" },
  { name: "University of Warwick", country: "United Kingdom", domain: "warwick.ac.uk" },
  { name: "University of Bristol", country: "United Kingdom", domain: "bristol.ac.uk" },
  { name: "University of Glasgow", country: "United Kingdom", domain: "gla.ac.uk" },
  { name: "University of Birmingham", country: "United Kingdom", domain: "bham.ac.uk" },
  { name: "University of Sheffield", country: "United Kingdom", domain: "sheffield.ac.uk" },
  { name: "University of Leeds", country: "United Kingdom", domain: "leeds.ac.uk" },
  { name: "University of Nottingham", country: "United Kingdom", domain: "nottingham.ac.uk" },
  { name: "University of Southampton", country: "United Kingdom", domain: "soton.ac.uk" },
  { name: "Queen Mary University of London", country: "United Kingdom", domain: "qmul.ac.uk" },
  { name: "University of York", country: "United Kingdom", domain: "york.ac.uk" },
  { name: "Durham University", country: "United Kingdom", domain: "durham.ac.uk" },
  { name: "University of St Andrews", country: "United Kingdom", domain: "st-andrews.ac.uk" },
  
  // Canada
  { name: "University of Toronto", country: "Canada", domain: "utoronto.ca" },
  { name: "McGill University", country: "Canada", domain: "mcgill.ca" },
  { name: "University of British Columbia", country: "Canada", domain: "ubc.ca" },
  { name: "University of Alberta", country: "Canada", domain: "ualberta.ca" },
  { name: "McMaster University", country: "Canada", domain: "mcmaster.ca" },
  { name: "University of Montreal", country: "Canada", domain: "umontreal.ca" },
  { name: "University of Waterloo", country: "Canada", domain: "uwaterloo.ca" },
  { name: "Western University", country: "Canada", domain: "uwo.ca" },
  { name: "Queen's University", country: "Canada", domain: "queensu.ca" },
  { name: "University of Calgary", country: "Canada", domain: "ucalgary.ca" },
  
  // Australia
  { name: "University of Melbourne", country: "Australia", domain: "unimelb.edu.au" },
  { name: "Australian National University", country: "Australia", domain: "anu.edu.au" },
  { name: "University of Sydney", country: "Australia", domain: "sydney.edu.au" },
  { name: "University of New South Wales", country: "Australia", domain: "unsw.edu.au" },
  { name: "University of Queensland", country: "Australia", domain: "uq.edu.au" },
  { name: "Monash University", country: "Australia", domain: "monash.edu" },
  { name: "University of Adelaide", country: "Australia", domain: "adelaide.edu.au" },
  { name: "University of Western Australia", country: "Australia", domain: "uwa.edu.au" },
  { name: "Macquarie University", country: "Australia", domain: "mq.edu.au" },
  { name: "University of Technology Sydney", country: "Australia", domain: "uts.edu.au" },
  
  // Germany
  { name: "Technical University of Munich", country: "Germany", domain: "tum.de" },
  { name: "Ludwig Maximilian University of Munich", country: "Germany", domain: "lmu.de" },
  { name: "Heidelberg University", country: "Germany", domain: "uni-heidelberg.de" },
  { name: "Humboldt University of Berlin", country: "Germany", domain: "hu-berlin.de" },
  { name: "Free University of Berlin", country: "Germany", domain: "fu-berlin.de" },
  { name: "RWTH Aachen University", country: "Germany", domain: "rwth-aachen.de" },
  { name: "University of Freiburg", country: "Germany", domain: "uni-freiburg.de" },
  { name: "University of Göttingen", country: "Germany", domain: "uni-goettingen.de" },
  { name: "University of Hamburg", country: "Germany", domain: "uni-hamburg.de" },
  { name: "University of Cologne", country: "Germany", domain: "uni-koeln.de" },
  
  // France
  { name: "Sorbonne University", country: "France", domain: "sorbonne-universite.fr" },
  { name: "École Normale Supérieure", country: "France", domain: "ens.fr" },
  { name: "École Polytechnique", country: "France", domain: "polytechnique.edu" },
  { name: "University of Paris", country: "France", domain: "u-paris.fr" },
  { name: "Sciences Po", country: "France", domain: "sciencespo.fr" },
  { name: "CentraleSupélec", country: "France", domain: "centralesupelec.fr" },
  { name: "INSEAD", country: "France", domain: "insead.edu" },
  { name: "HEC Paris", country: "France", domain: "hec.fr" },
  { name: "University of Strasbourg", country: "France", domain: "unistra.fr" },
  { name: "Aix-Marseille University", country: "France", domain: "univ-amu.fr" },
  
  // Netherlands
  { name: "University of Amsterdam", country: "Netherlands", domain: "uva.nl" },
  { name: "Delft University of Technology", country: "Netherlands", domain: "tudelft.nl" },
  { name: "Utrecht University", country: "Netherlands", domain: "uu.nl" },
  { name: "Leiden University", country: "Netherlands", domain: "leidenuniv.nl" },
  { name: "Eindhoven University of Technology", country: "Netherlands", domain: "tue.nl" },
  { name: "University of Groningen", country: "Netherlands", domain: "rug.nl" },
  { name: "VU University Amsterdam", country: "Netherlands", domain: "vu.nl" },
  { name: "Erasmus University Rotterdam", country: "Netherlands", domain: "eur.nl" },
  { name: "Tilburg University", country: "Netherlands", domain: "tilburguniversity.edu" },
  { name: "Radboud University", country: "Netherlands", domain: "ru.nl" },
  
  // Switzerland
  { name: "ETH Zurich", country: "Switzerland", domain: "ethz.ch" },
  { name: "École Polytechnique Fédérale de Lausanne", country: "Switzerland", domain: "epfl.ch" },
  { name: "University of Zurich", country: "Switzerland", domain: "uzh.ch" },
  { name: "University of Geneva", country: "Switzerland", domain: "unige.ch" },
  { name: "University of Basel", country: "Switzerland", domain: "unibas.ch" },
  { name: "University of Bern", country: "Switzerland", domain: "unibe.ch" },
  { name: "University of Lausanne", country: "Switzerland", domain: "unil.ch" },
  
  // Sweden
  { name: "Karolinska Institute", country: "Sweden", domain: "ki.se" },
  { name: "KTH Royal Institute of Technology", country: "Sweden", domain: "kth.se" },
  { name: "Stockholm University", country: "Sweden", domain: "su.se" },
  { name: "University of Gothenburg", country: "Sweden", domain: "gu.se" },
  { name: "Lund University", country: "Sweden", domain: "lu.se" },
  { name: "Uppsala University", country: "Sweden", domain: "uu.se" },
  
  // Japan
  { name: "University of Tokyo", country: "Japan", domain: "u-tokyo.ac.jp" },
  { name: "Kyoto University", country: "Japan", domain: "kyoto-u.ac.jp" },
  { name: "Osaka University", country: "Japan", domain: "osaka-u.ac.jp" },
  { name: "Tokyo Institute of Technology", country: "Japan", domain: "titech.ac.jp" },
  { name: "Tohoku University", country: "Japan", domain: "tohoku.ac.jp" },
  { name: "Nagoya University", country: "Japan", domain: "nagoya-u.ac.jp" },
  { name: "Hokkaido University", country: "Japan", domain: "hokudai.ac.jp" },
  { name: "Keio University", country: "Japan", domain: "keio.ac.jp" },
  { name: "Waseda University", country: "Japan", domain: "waseda.jp" },
  { name: "Kyushu University", country: "Japan", domain: "kyushu-u.ac.jp" },
  
  // China
  { name: "Tsinghua University", country: "China", domain: "tsinghua.edu.cn" },
  { name: "Peking University", country: "China", domain: "pku.edu.cn" },
  { name: "Fudan University", country: "China", domain: "fudan.edu.cn" },
  { name: "Shanghai Jiao Tong University", country: "China", domain: "sjtu.edu.cn" },
  { name: "Zhejiang University", country: "China", domain: "zju.edu.cn" },
  { name: "University of Science and Technology of China", country: "China", domain: "ustc.edu.cn" },
  { name: "Nanjing University", country: "China", domain: "nju.edu.cn" },
  { name: "Xi'an Jiaotong University", country: "China", domain: "xjtu.edu.cn" },
  { name: "Harbin Institute of Technology", country: "China", domain: "hit.edu.cn" },
  { name: "Beijing Institute of Technology", country: "China", domain: "bit.edu.cn" },
  
  // South Korea
  { name: "Seoul National University", country: "South Korea", domain: "snu.ac.kr" },
  { name: "KAIST", country: "South Korea", domain: "kaist.ac.kr" },
  { name: "Yonsei University", country: "South Korea", domain: "yonsei.ac.kr" },
  { name: "Korea University", country: "South Korea", domain: "korea.ac.kr" },
  { name: "Pohang University of Science and Technology", country: "South Korea", domain: "postech.ac.kr" },
  { name: "Sungkyunkwan University", country: "South Korea", domain: "skku.edu" },
  
  // Singapore
  { name: "National University of Singapore", country: "Singapore", domain: "nus.edu.sg" },
  { name: "Nanyang Technological University", country: "Singapore", domain: "ntu.edu.sg" },
  { name: "Singapore Management University", country: "Singapore", domain: "smu.edu.sg" },
  
  // Hong Kong
  { name: "University of Hong Kong", country: "Hong Kong", domain: "hku.hk" },
  { name: "Hong Kong University of Science and Technology", country: "Hong Kong", domain: "ust.hk" },
  { name: "Chinese University of Hong Kong", country: "Hong Kong", domain: "cuhk.edu.hk" },
  { name: "City University of Hong Kong", country: "Hong Kong", domain: "cityu.edu.hk" },
  { name: "Hong Kong Polytechnic University", country: "Hong Kong", domain: "polyu.edu.hk" }
];

// Prepare the insert statement
const insertUniversity = db.prepare(`
  INSERT OR IGNORE INTO universities (name, country, domain)
  VALUES (?, ?, ?)
`);

// Seed the database
console.log('Starting university seeding...');
let insertedCount = 0;

const insertMany = db.transaction((universities) => {
  for (const university of universities) {
    const result = insertUniversity.run(university.name, university.country, university.domain);
    if (result.changes > 0) {
      insertedCount++;
    }
  }
});

try {
  insertMany(universities);
  console.log(`✅ Seeding complete! Inserted ${insertedCount} new universities.`);
  console.log(`Total universities in list: ${universities.length}`);
} catch (error) {
  console.error('❌ Seeding failed:', error);
} finally {
  db.close();
}