#!/usr/bin/env python3

"""
Comprehensive comparison between Excel data and database data
to identify missing data and create update queries.
"""

import pandas as pd
import psycopg2
import json
from datetime import datetime

def connect_to_database():
    """Connect to PostgreSQL database"""
    try:
        conn = psycopg2.connect(
            host="localhost",
            database="illuminate_db",
            user="postgres",
            password="postgres",
            port="5432"
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None

def get_database_data():
    """Fetch all data from industry_benchmarking table"""
    conn = connect_to_database()
    if not conn:
        return None
    
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM industry_benchmarking ORDER BY organization_name")
        columns = [desc[0] for desc in cursor.description]
        rows = cursor.fetchall()
        
        # Convert to list of dictionaries
        data = []
        for row in rows:
            data.append(dict(zip(columns, row)))
        
        return data
    except Exception as e:
        print(f"Database query error: {e}")
        return None
    finally:
        conn.close()

def get_excel_data():
    """Read and process Excel data from all sheets"""
    excel_file = 'migrations/files/Cement_benchmarking_data.xlsx'
    
    try:
        # Read Environmental sheet
        env_df = pd.read_excel(excel_file, sheet_name='Environmental')
        env_df = env_df.rename(columns={
            'Company Name': 'organization_name',
            'Revenue (Rs.)': 'revenue',
            'Scope 1 (MTCO2e)': 'scope_1',
            'Scope 1 Intensity (MTCO2e/million Rs.)': 'scope_1_intensity',
            'Scope 2 (MTCO2e)': 'scope_2',
            'Scope 2 Intensity (MTCO2e/million Rs.)': 'scope_2_intensity',
            'Scope 3 (MTCO2e)': 'scope_3',
            'Scope 3 Intensity (MTCO2e/million Rs.)': 'scope_3_intensity',
            'Water Consumption (m3)': 'water_consumption',
            'Water Consumption (m3/million Rs.)': 'water_consumption_intensity',
            'Water Withdrawal (m3)': 'water_withdrawal',
            'Water Withdrawal (m3/million Rs.)': 'water_withdrawal_intensity',
            'Waste Generated (MT/million Rs.)': 'waste_generated_intensity',
            'Renewable energy consumption (Joules or multiples / million Rs.)': 'renewable_energy_intensity',
            'Total energy consumption (Joules or multiples / million Rs.)': 'total_energy_intensity'
        })
        
        # Read Social sheet
        social_df = pd.read_excel(excel_file, sheet_name='Social')
        social_df = social_df.rename(columns={
            'Company Name': 'organization_name',
            'Male Employee %': 'male_employee_percentage',
            'Female Employee %': 'female_employee_percentage',
            'Permanent Employees (Head Count / million Rs.)': 'permanent_employees_per_million_rs',
            'Other Than Permanent Employees (Head Count / million Rs.)': 'other_employees_per_million_rs',
            'Sourced From MSMEs/Small Producers Percentage(%)': 'msme_sourcing_percentage',
            'Health and Safety Complaints': 'health_safety_complaints',
            'Working Conditions Complaints': 'working_conditions_complaints',
            'Child Labour Complaints': 'child_labour_complaints',
            'Discrimination Complaints': 'discrimination_complaints',
            'Forced or Involuntary Labour Complaints': 'forced_labour_complaints',
            'Other Human Rights Complaints': 'other_human_rights_complaints',
            'Sexual Harassment Complaints': 'sexual_harassment_complaints',
            'Wages Complaints': 'wages_complaints',
            'POSH Complaints': 'posh_complaints'
        })
        
        # Read Targets sheet
        targets_df = pd.read_excel(excel_file, sheet_name='Targets And Goals')
        
        # Read Initiatives sheet
        initiatives_df = pd.read_excel(excel_file, sheet_name='Initiatives')
        
        # Read Sources sheet
        sources_df = pd.read_excel(excel_file, sheet_name='Sources')
        
        return {
            'environmental': env_df,
            'social': social_df,
            'targets': targets_df,
            'initiatives': initiatives_df,
            'sources': sources_df
        }
    except Exception as e:
        print(f"Excel reading error: {e}")
        return None

def compare_data():
    """Compare Excel data with database data"""
    print("🔍 COMPREHENSIVE DATA COMPARISON")
    print("=" * 80)
    
    # Get data
    db_data = get_database_data()
    excel_data = get_excel_data()
    
    if not db_data or not excel_data:
        print("❌ Failed to fetch data")
        return
    
    # Convert database data to DataFrame for easier comparison
    db_df = pd.DataFrame(db_data)
    
    print(f"📊 Database records: {len(db_df)}")
    print(f"📊 Excel environmental records: {len(excel_data['environmental'])}")
    print(f"📊 Excel social records: {len(excel_data['social'])}")
    print()
    
    # 1. Compare Environmental Data
    print("🌍 ENVIRONMENTAL DATA COMPARISON")
    print("-" * 50)
    
    env_excel = excel_data['environmental']
    env_columns = ['scope_1', 'scope_2', 'scope_3', 'water_consumption', 'water_withdrawal', 
                   'scope_1_intensity', 'scope_2_intensity', 'scope_3_intensity',
                   'water_consumption_intensity', 'water_withdrawal_intensity', 'waste_generated_intensity',
                   'renewable_energy_intensity', 'total_energy_intensity']
    
    missing_env_data = []
    for _, excel_row in env_excel.iterrows():
        org_name = excel_row['organization_name']
        db_row = db_df[db_df['organization_name'] == org_name]
        
        if len(db_row) == 0:
            print(f"❌ {org_name} not found in database")
            continue
            
        db_row = db_row.iloc[0]
        
        for col in env_columns:
            excel_val = excel_row[col]
            db_val = db_row[col]
            
            # Check if Excel has data but DB doesn't
            if pd.notna(excel_val) and pd.isna(db_val):
                missing_env_data.append({
                    'organization_name': org_name,
                    'column': col,
                    'excel_value': excel_val,
                    'db_value': db_val
                })
    
    if missing_env_data:
        print(f"Found {len(missing_env_data)} missing environmental data points:")
        for item in missing_env_data:
            print(f"  {item['organization_name']} - {item['column']}: {item['excel_value']} (Excel) vs {item['db_value']} (DB)")
    else:
        print("✅ All environmental data matches")
    
    print()
    
    # 2. Compare Social Data
    print("👥 SOCIAL DATA COMPARISON")
    print("-" * 50)
    
    social_excel = excel_data['social']
    social_columns = ['male_employee_percentage', 'female_employee_percentage', 
                     'permanent_employees_per_million_rs', 'other_employees_per_million_rs',
                     'msme_sourcing_percentage', 'health_safety_complaints', 
                     'working_conditions_complaints', 'posh_complaints']
    
    missing_social_data = []
    for _, excel_row in social_excel.iterrows():
        org_name = excel_row['organization_name']
        db_row = db_df[db_df['organization_name'] == org_name]
        
        if len(db_row) == 0:
            continue
            
        db_row = db_row.iloc[0]
        
        for col in social_columns:
            excel_val = excel_row[col]
            db_val = db_row[col]
            
            # Check if Excel has data but DB doesn't
            if pd.notna(excel_val) and pd.isna(db_val):
                missing_social_data.append({
                    'organization_name': org_name,
                    'column': col,
                    'excel_value': excel_val,
                    'db_value': db_val
                })
    
    if missing_social_data:
        print(f"Found {len(missing_social_data)} missing social data points:")
        for item in missing_social_data:
            print(f"  {item['organization_name']} - {item['column']}: {item['excel_value']} (Excel) vs {item['db_value']} (DB)")
    else:
        print("✅ All social data matches")
    
    print()
    
    # 3. Check for missing companies
    print("🏢 COMPANY COMPARISON")
    print("-" * 50)
    
    excel_companies = set(env_excel['organization_name'].tolist())
    db_companies = set(db_df['organization_name'].tolist())
    
    missing_in_db = excel_companies - db_companies
    missing_in_excel = db_companies - excel_companies
    
    if missing_in_db:
        print(f"Companies in Excel but not in DB: {missing_in_db}")
    if missing_in_excel:
        print(f"Companies in DB but not in Excel: {missing_in_excel}")
    
    if not missing_in_db and not missing_in_excel:
        print("✅ All companies match between Excel and database")
    
    print()
    
    # 4. Generate update queries for missing data
    print("🔧 GENERATING UPDATE QUERIES")
    print("-" * 50)
    
    if missing_env_data or missing_social_data:
        print("-- Update queries for missing data:")
        print()
        
        # Group by organization
        all_missing = missing_env_data + missing_social_data
        updates_by_org = {}
        
        for item in all_missing:
            org = item['organization_name']
            if org not in updates_by_org:
                updates_by_org[org] = []
            updates_by_org[org].append(item)
        
        for org, updates in updates_by_org.items():
            print(f"-- Updates for {org}:")
            set_clauses = []
            for update in updates:
                col = update['column']
                val = update['excel_value']
                if pd.isna(val):
                    set_clauses.append(f"{col} = NULL")
                elif isinstance(val, str):
                    set_clauses.append(f"{col} = '{val}'")
                else:
                    set_clauses.append(f"{col} = {val}")
            
            query = f"UPDATE industry_benchmarking SET {', '.join(set_clauses)} WHERE organization_name = '{org}';"
            print(query)
            print()
    
    # 5. Check for additional data that could be added
    print("📈 ADDITIONAL DATA ANALYSIS")
    print("-" * 50)
    
    # Check if we have targets data that could be added
    targets_df = excel_data['targets']
    print(f"Targets data available for {len(targets_df)} records")
    
    # Check if we have initiatives data
    initiatives_df = excel_data['initiatives']
    print(f"Initiatives data available for {len(initiatives_df)} records")
    
    # Check if we have sources data
    sources_df = excel_data['sources']
    print(f"Sources data available for {len(sources_df)} records")
    
    print()
    print("=" * 80)
    print("✅ Comparison complete!")

if __name__ == "__main__":
    compare_data()

