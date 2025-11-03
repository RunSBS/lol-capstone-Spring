package hyun.db.config;

import org.hibernate.boot.model.naming.Identifier;
import org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl;
import org.hibernate.engine.jdbc.env.spi.JdbcEnvironment;

/**
 * Oracle용 Physical Naming Strategy
 * - 테이블명과 컬럼명을 대문자로 변환
 */
public class OracleNamingStrategy extends PhysicalNamingStrategyStandardImpl {
    
    @Override
    public Identifier toPhysicalCatalogName(Identifier identifier, JdbcEnvironment jdbcEnvironment) {
        return convertToUpperCase(identifier);
    }

    @Override
    public Identifier toPhysicalSchemaName(Identifier identifier, JdbcEnvironment jdbcEnvironment) {
        return convertToUpperCase(identifier);
    }

    @Override
    public Identifier toPhysicalTableName(Identifier identifier, JdbcEnvironment jdbcEnvironment) {
        return convertToUpperCase(identifier);
    }

    @Override
    public Identifier toPhysicalSequenceName(Identifier identifier, JdbcEnvironment jdbcEnvironment) {
        return convertToUpperCase(identifier);
    }

    @Override
    public Identifier toPhysicalColumnName(Identifier identifier, JdbcEnvironment jdbcEnvironment) {
        return convertToUpperCase(identifier);
    }

    private Identifier convertToUpperCase(Identifier identifier) {
        if (identifier == null) {
            return null;
        }
        String name = identifier.getText();
        // 이미 따옴표로 감싸져 있으면 그대로 반환
        if (name != null && name.startsWith("\"") && name.endsWith("\"")) {
            return identifier;
        }
        // 대문자로 변환하여 따옴표로 감싸서 반환
        return Identifier.toIdentifier(name.toUpperCase(), identifier.isQuoted());
    }
}

