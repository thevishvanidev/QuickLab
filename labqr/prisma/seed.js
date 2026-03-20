const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Delete existing data for clean seed
  await prisma.bookingItem.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.test.deleteMany()
  await prisma.lab.deleteMany()

  const lab = await prisma.lab.create({
    data: {
      id: 'demo-lab-001',
      name: 'HealthPath Diagnostics',
      phone: '+91 98765 43210',
      address: '12, Medical Complex, MG Road, Bengaluru - 560001',
      tests: {
        create: [
          { name: 'Complete Blood Count (CBC)',    description: 'Full blood panel including RBC, WBC, platelets', price: 299,  category: 'Blood'     },
          { name: 'Blood Sugar (Fasting)',          description: 'Measures glucose levels after overnight fast',   price: 149,  category: 'Blood'     },
          { name: 'HbA1c',                          description: 'Average blood sugar over last 3 months',         price: 499,  category: 'Blood'     },
          { name: 'Lipid Profile',                  description: 'Cholesterol, triglycerides, HDL, LDL',           price: 599,  category: 'Blood'     },
          { name: 'Thyroid Profile (T3/T4/TSH)',    description: 'Comprehensive thyroid function test',             price: 799,  category: 'Hormone'   },
          { name: 'Liver Function Test (LFT)',      description: 'SGOT, SGPT, bilirubin and full liver panel',     price: 699,  category: 'Organ'     },
          { name: 'Kidney Function Test (KFT)',     description: 'Creatinine, urea, uric acid levels',             price: 649,  category: 'Organ'     },
          { name: 'Vitamin D',                      description: '25-OH Vitamin D levels in blood',                price: 899,  category: 'Vitamin'   },
          { name: 'Vitamin B12',                    description: 'Cobalamin levels in blood',                      price: 749,  category: 'Vitamin'   },
          { name: 'Urine Routine & Microscopy',     description: 'Complete urine examination',                     price: 129,  category: 'Urine'     },
          { name: 'Dengue NS1 Antigen',             description: 'Early dengue fever detection test',              price: 849,  category: 'Infection' },
          { name: 'Malaria Antigen Test',           description: 'Rapid malaria detection',                        price: 399,  category: 'Infection' },
        ],
      },
    },
  })

  console.log('✅ Seeded lab:', lab.name)
  console.log('   Lab ID:', lab.id)
  console.log('   Visit: http://localhost:3000/lab/demo-lab-001')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
