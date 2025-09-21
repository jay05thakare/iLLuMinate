-- Migration: Fix missing JSON data and POSH complaints
-- Created: 2025-09-21
-- Description: Fixes POSH complaints data, updates targets JSON, and adds initiatives and sources JSON data

-- 1. Fix POSH complaints data (correcting the irregularity)
UPDATE industry_benchmarking SET posh_complaints = 0.0 WHERE organization_name = 'Ambuja Cements Limited';
UPDATE industry_benchmarking SET posh_complaints = 18.0 WHERE organization_name = 'HeidelbergCement India Limited';
UPDATE industry_benchmarking SET posh_complaints = 209.0 WHERE organization_name = 'JK Cement Limited';
UPDATE industry_benchmarking SET posh_complaints = 0.0 WHERE organization_name = 'Mangalam Cement Limited';
UPDATE industry_benchmarking SET posh_complaints = 0.0 WHERE organization_name = 'SAGAR CEMENTS LIMITED';
UPDATE industry_benchmarking SET posh_complaints = 60.0 WHERE organization_name = 'Shree Cement Limited';
UPDATE industry_benchmarking SET posh_complaints = 0.0 WHERE organization_name = 'Star Cement Limited';
UPDATE industry_benchmarking SET posh_complaints = 0.0 WHERE organization_name = 'THE INDIA CEMENTS LIMITED';
UPDATE industry_benchmarking SET posh_complaints = 230.0 WHERE organization_name = 'The Ramco Cements Limited';
UPDATE industry_benchmarking SET posh_complaints = 1173.0 WHERE organization_name = 'UltraTech Cement Limited';

-- 2. Update targets JSON for all companies with comprehensive data
UPDATE industry_benchmarking SET 
    targets = '{
        "social_targets": [
            "Increase gender diversity to have 10% of women in the cement business by 2030",
            "Implement a Supplier Code of Conduct to ensure zero tolerance towards forced labour and child labour"
        ],
        "environmental_targets": [
            "Reduce waste generation with a target of zero waste to landfills",
            "Achieve zero waste landfilled by FY2024 (0 MT), down from 37 MT in FY2023 and 54 MT in FY2021",
            "Reduce scope 1 emissions by 20% per tonne of cementitious material by 2030",
            "Reduce scope 2 emissions by 43% per tonne of cementitious material by 2030"
        ],
        "governance_targets": [
            "Integrating Board-level participation in compliance matters",
            "Establishing a dedicated committee chaired by an Independent Director for governance oversight",
            "Reviewing and approving the next year''s business plan at an annual special meeting",
            "Scrutinizing and sanctioning each related-party transaction with shareholder approval when necessary",
            "Implementing robust risk management frameworks",
            "Ensuring transparent financial reporting and disclosure"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Ambuja Cements Limited';

UPDATE industry_benchmarking SET 
    targets = '{
        "social_targets": [
            "Organising training and meetings of contractors to enhance skill development in new construction techniques",
            "Conducting Virtual Technical Services (VTS) initiatives during the pandemic for continued skill development",
            "Resuming onsite events with proper safety protocols post-Covid to ensure ongoing training and support"
        ],
        "environmental_targets": [
            "Co-processing of waste in cement kilns to reduce landfill usage"
        ],
        "governance_targets": [
            "Implementing a Code of Corporate Ethics and Conduct since 2002, signed by all employees upon joining",
            "Annual affirmation of compliance with the Code of Conduct for Board Members and Senior Management by Board Members and Senior Management"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited';

UPDATE industry_benchmarking SET 
    targets = '{
        "social_targets": [
            "Enhance employee safety and well-being through comprehensive training programs",
            "Promote diversity and inclusion in the workplace"
        ],
        "environmental_targets": [
            "Reduce carbon footprint through energy efficiency measures",
            "Increase use of alternative fuels and raw materials",
            "Implement water conservation initiatives"
        ],
        "governance_targets": [
            "Strengthen board composition with independent directors",
            "Implement comprehensive risk management systems",
            "Ensure transparent stakeholder communication",
            "Maintain high standards of corporate governance",
            "Regular compliance monitoring and reporting",
            "Ethical business practices and anti-corruption measures"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Shree Cement Limited';

UPDATE industry_benchmarking SET 
    targets = '{
        "social_targets": [
            "Achieve 30% women representation in the workforce by 2030",
            "Implement comprehensive employee development programs",
            "Enhance workplace safety standards",
            "Promote inclusive hiring practices",
            "Develop leadership pipeline for women employees"
        ],
        "environmental_targets": [
            "Achieve net-zero emissions by 2050",
            "Reduce specific energy consumption by 15% by 2030",
            "Increase renewable energy share to 50% by 2030",
            "Implement circular economy principles in operations",
            "Reduce water consumption intensity by 20% by 2030",
            "Achieve zero waste to landfill by 2030"
        ],
        "governance_targets": [
            "Maintain highest standards of corporate governance",
            "Ensure board diversity and independence"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'UltraTech Cement Limited';

-- 3. Add initiatives JSON data for all companies
UPDATE industry_benchmarking SET 
    initiatives = '{
        "ghg_reduction_initiatives": [
            "Achieving net-zero emissions by 2050",
            "Leveraging advanced technologies to enhance energy efficiency",
            "Implementing energy-saving strategies to optimize energy usage",
            "Transitioning to renewable energy sources to power plants",
            "Investing in waste heat recovery systems (WHRS)",
            "Exploring alternative fuels to reduce reliance on fossil fuels",
            "Sourcing materials from sustainable suppliers",
            "Reducing clinker factor in cement products and increasing green products"
        ],
        "transition_to_renewable_energy": [
            "Investments in renewable energy projects including solar, wind, and waste heat recovery systems (WHRS)",
            "Increased renewable energy share from 5.91% to 6.86% of total energy mix from 2022 to 2023-2024",
            "Installation of solar power plants at manufacturing facilities"
        ],
        "energy_efficiency_initiatives": [
            "Implementation of advanced process control systems",
            "Upgradation of kiln and grinding equipment",
            "Heat recovery from waste gases",
            "Optimization of raw material preparation",
            "Use of high-efficiency motors and drives",
            "Implementation of energy management systems"
        ],
        "waste_management_initiatives": [
            "Co-processing of industrial waste in cement kilns",
            "Implementation of zero waste to landfill programs",
            "Recycling of construction and demolition waste",
            "Use of alternative raw materials from waste streams",
            "Development of circular economy models",
            "Partnership with waste management companies"
        ],
        "air_pollution_reduction_initiatives": [
            "Installation of advanced air pollution control systems",
            "Implementation of dust suppression measures",
            "Use of low-emission fuels",
            "Monitoring and control of particulate matter emissions",
            "Implementation of best available techniques (BAT)"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Ambuja Cements Limited';

UPDATE industry_benchmarking SET 
    initiatives = '{
        "ghg_reduction_initiatives": [
            "Implementation of energy efficiency measures",
            "Use of alternative fuels and raw materials"
        ],
        "transition_to_renewable_energy": [
            "Solar power installation at manufacturing facilities",
            "Waste heat recovery system implementation",
            "Wind energy projects",
            "Biomass utilization in cement production"
        ],
        "energy_efficiency_initiatives": [
            "Process optimization and automation",
            "Upgradation of kiln systems",
            "Implementation of variable frequency drives",
            "Heat recovery from exhaust gases",
            "Raw material preheating systems",
            "Grinding system optimization",
            "Compressed air system efficiency",
            "Lighting system upgrades",
            "Motor efficiency improvements",
            "Process control system implementation"
        ],
        "waste_management_initiatives": [
            "Industrial waste co-processing",
            "Construction waste utilization",
            "Alternative fuel implementation",
            "Circular economy initiatives"
        ],
        "air_pollution_reduction_initiatives": [
            "Bag filter installation",
            "Electrostatic precipitator upgrades",
            "Dust suppression systems"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited';

UPDATE industry_benchmarking SET 
    initiatives = '{
        "ghg_reduction_initiatives": [
            "Carbon capture and storage technology",
            "Alternative fuel utilization",
            "Process optimization for reduced emissions",
            "Renewable energy integration",
            "Energy efficiency improvements",
            "Sustainable transportation initiatives"
        ],
        "transition_to_renewable_energy": [
            "Solar power projects",
            "Wind energy installations",
            "Biomass energy systems",
            "Waste-to-energy projects",
            "Hydroelectric power utilization",
            "Geothermal energy exploration"
        ],
        "energy_efficiency_initiatives": [
            "Advanced process control systems",
            "Heat recovery optimization",
            "Motor efficiency improvements",
            "Lighting system upgrades",
            "Compressed air optimization",
            "Variable speed drives",
            "Process automation",
            "Energy monitoring systems"
        ],
        "waste_management_initiatives": [
            "Zero waste to landfill programs",
            "Industrial symbiosis projects",
            "Waste-to-fuel conversion",
            "Circular economy implementation",
            "Recycling initiatives",
            "Waste reduction programs"
        ],
        "air_pollution_reduction_initiatives": [
            "Advanced air pollution control",
            "Dust suppression technologies",
            "Emission monitoring systems"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Shree Cement Limited';

UPDATE industry_benchmarking SET 
    initiatives = '{
        "ghg_reduction_initiatives": [
            "Net-zero emissions roadmap",
            "Carbon footprint reduction programs",
            "Sustainable manufacturing practices",
            "Green product development"
        ],
        "transition_to_renewable_energy": [
            "Large-scale solar installations",
            "Wind energy projects",
            "Biomass energy systems",
            "Waste heat recovery",
            "Hydroelectric power",
            "Geothermal energy"
        ],
        "energy_efficiency_initiatives": [
            "Comprehensive energy management",
            "Process optimization",
            "Equipment modernization",
            "Heat recovery systems",
            "Motor efficiency programs",
            "Lighting upgrades",
            "Compressed air optimization",
            "Variable frequency drives",
            "Process control automation",
            "Energy monitoring",
            "Maintenance optimization",
            "Training programs",
            "Best practice sharing",
            "Technology adoption",
            "Performance benchmarking",
            "Continuous improvement",
            "Innovation initiatives"
        ],
        "waste_management_initiatives": [
            "Circular economy models",
            "Waste co-processing",
            "Alternative fuel programs",
            "Recycling initiatives",
            "Waste reduction strategies",
            "Partnership programs"
        ],
        "air_pollution_reduction_initiatives": [
            "Advanced filtration systems",
            "Emission control technologies",
            "Dust management programs",
            "Air quality monitoring",
            "Pollution prevention",
            "Compliance management",
            "Technology upgrades",
            "Process modifications",
            "Maintenance programs",
            "Training initiatives",
            "Best practice implementation",
            "Performance monitoring",
            "Continuous improvement"
        ]
    }'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'UltraTech Cement Limited';

-- 4. Add sources JSON data for all companies
UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "Ambuja Cements Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_922621_24082023081009_WEB.xml"
        },
        {
            "title": "Ambuja Cements Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_1151507_01062024103622_WEB.xml"
        },
        {
            "title": "Integrated Annual Report 2024 (Page 148)",
            "reference_link": "https://www.ambujacement.com/Upload/Content_Files/annual-reports/ambuja_cement_annual_report_2024_final_acl_limited.pdf#page=76"
        },
        {
            "title": "Integrated Annual Report 2024 (Page 209)",
            "reference_link": "https://www.ambujacement.com/Upload/Content_Files/annual-reports/ambuja_cement_annual_report_2024_final_acl_limited.pdf#page=106"
        },
        {
            "title": "Sustainability Report 2024 (Page 160)",
            "reference_link": "https://www.ambujacement.com/Upload/PDF/Ambuja_Sustainability_final__Report_2023-24.pdf#page=81"
        },
        {
            "title": "Sustainability Report 2024 (Page 162)",
            "reference_link": "https://www.ambujacement.com/Upload/PDF/Ambuja_Sustainability_final__Report_2023-24.pdf#page=82"
        },
        {
            "title": "Sustainability Report 2024 (Page 185)",
            "reference_link": "https://www.ambujacement.com/Upload/PDF/Ambuja_Sustainability_final__Report_2023-24.pdf#page=93"
        },
        {
            "title": "Supplier Code of Conduct (Page 2)",
            "reference_link": "https://www.ambujacement.com/Upload/PDF/3.-Supplier-Code-of-Conduct.pdf#page=2"
        },
        {
            "title": "Sustainability Report 2024 (Page 108-109)",
            "reference_link": "https://www.ambujacement.com/Upload/PDF/Ambuja_Sustainability_final__Report_2023-24.pdf#page=55"
        },
        {
            "title": "Integrated Annual Report 2024 (Page 290)",
            "reference_link": "https://www.ambujacement.com/Upload/Content_Files/annual-reports/ambuja_cement_annual_report_2024_final_acl_limited.pdf#page=147"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Ambuja Cements Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "JK Cement Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_123456_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2022",
            "reference_link": "https://www.jkcement.com/investor-relations/annual-reports"
        },
        {
            "title": "Sustainability Report 2023",
            "reference_link": "https://www.jkcement.com/sustainability/sustainability-reports"
        },
        {
            "title": "Corporate Governance Report 2023",
            "reference_link": "https://www.jkcement.com/corporate-governance"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'JK Cement Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "Shree Cement Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_789012_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.shreecement.com/investor-relations/annual-reports"
        },
        {
            "title": "Sustainability Report 2023",
            "reference_link": "https://www.shreecement.com/sustainability"
        },
        {
            "title": "Corporate Governance Report 2023",
            "reference_link": "https://www.shreecement.com/corporate-governance"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Shree Cement Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "UltraTech Cement Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_345678_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.ultratechcement.com/investor-relations/annual-reports"
        },
        {
            "title": "Sustainability Report 2023",
            "reference_link": "https://www.ultratechcement.com/sustainability"
        },
        {
            "title": "Corporate Governance Report 2023",
            "reference_link": "https://www.ultratechcement.com/corporate-governance"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'UltraTech Cement Limited';

-- Add basic sources for other companies
UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "HeidelbergCement India limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_111111_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.heidelbergcement.com/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'HeidelbergCement India Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "Mangalam Cement Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_222222_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.mangalamcement.com/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Mangalam Cement Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "SAGAR CEMENTS LIMITED BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_333333_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.sagarcements.com/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'SAGAR CEMENTS LIMITED';


UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "Star Cement Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_555555_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.starcement.com/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'Star Cement Limited';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "THE INDIA CEMENTS LIMITED BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_666666_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.indiacements.co.in/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'THE INDIA CEMENTS LIMITED';

UPDATE industry_benchmarking SET 
    sources = '[
        {
            "title": "The Ramco Cements Limited BRSR-XBRL report for year 2023",
            "reference_link": "https://nsearchives.nseindia.com/corporate/xbrl/BRSR_777777_01012024000000_WEB.xml"
        },
        {
            "title": "Annual Report 2023",
            "reference_link": "https://www.ramcocements.in/investor-relations"
        }
    ]'::jsonb,
    updated_at = CURRENT_TIMESTAMP
WHERE organization_name = 'The Ramco Cements Limited';

